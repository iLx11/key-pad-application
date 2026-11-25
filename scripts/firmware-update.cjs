const fs = require('node:fs/promises')
const { SerialPort } = require('serialport')

const VENDOR = '07CF'
const BOOT_PID = '4F10'
const APP_PID = '4F0F'
const ACK = Buffer.from('MPA1')
const APP_CAPABILITY = Buffer.from([0xaa, 0xbb, 0xcc, 0x4d, 0x50, 0x53, 0x43, 1, 0x55])
const APP_BASE = 0x08008000
const MAX_IMAGE = 0x38000
const PAYLOAD = 40
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function crc32(bytes) {
  let value = 0xffffffff
  for (const byte of bytes) {
    value ^= byte
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0)
  }
  return (~value) >>> 0
}

function validateImage(bytes) {
  if (bytes.length < 8 || bytes.length > MAX_IMAGE) throw Error('固件文件大小无效')
  const stack = bytes.readUInt32LE(0)
  const reset = bytes.readUInt32LE(4)
  if (stack < 0x20000008 || stack > 0x2000fff8 || (stack & 7) ||
      !(reset & 1) || reset < APP_BASE + 1 || reset >= APP_BASE + bytes.length) {
    throw Error('需要为 USB Bootloader 编译的 usb-app/leden.bin')
  }
}

async function list(pid) {
  return (await SerialPort.list()).filter(p => p.vendorId?.toUpperCase() === VENDOR &&
    p.productId?.toUpperCase() === pid)
}

async function waitForDevice(pid, seconds = 18) {
  const deadline = Date.now() + seconds * 1000
  do {
    const candidates = await list(pid)
    if (candidates.length > 1) throw Error('请只保留一台 MultiPad 的 USB 连接')
    if (candidates.length === 1) return candidates[0].path
    await delay(250)
  } while (Date.now() < deadline)
  throw Error(pid === BOOT_PID ? '未找到 MultiPad USB 升级设备' : '升级后未找到键盘串口')
}

async function open(path) {
  const port = new SerialPort({path, baudRate: 115200, autoOpen: false})
  port.on('error', () => {}) // In-flight operations handle transport errors.
  await new Promise((resolve, reject) => port.open(error => error ? reject(error) : resolve()))
  return port
}

async function close(port) {
  if (!port?.isOpen) return
  await new Promise(resolve => port.close(() => resolve()))
}

function write(port, bytes) {
  return new Promise((resolve, reject) => port.write(bytes, error => {
    if (error) return reject(error)
    port.drain(error => error ? reject(error) : resolve())
  }))
}

function exchange(port, request, decode, timeout = 3000) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0)
    const finish = (error, value) => {
      clearTimeout(timer)
      port.off('data', receive)
      port.off('close', disconnected)
      port.off('error', disconnected)
      if(error) reject(error)
      else resolve(value)
    }
    const disconnected = () => finish(Error('USB 连接已断开'))
    const receive = chunk => {
      buffer = Buffer.concat([buffer, chunk]).subarray(-128)
      try {
        const value = decode(buffer)
        if (value !== undefined) finish(null, value)
      } catch (error) { finish(error) }
    }
    const timer = setTimeout(() => finish(Error('等待 USB 升级设备响应超时')), timeout)
    port.on('data', receive)
    port.on('close', disconnected)
    port.on('error', disconnected)
    write(port, request).catch(error => finish(error))
  })
}

function command(port, opcode, value = 0, crc = 0, data = Buffer.alloc(0)) {
  const frame = Buffer.alloc(56)
  frame.write('MPU1')
  frame[4] = opcode
  frame[5] = data.length
  frame.writeUInt32LE(value, 8)
  frame.writeUInt32LE(crc, 12)
  data.copy(frame, 16)
  return exchange(port, frame, buffer => {
    const start = buffer.indexOf(ACK)
    if (start < 0 || buffer.length < start + 12) return undefined
    if (buffer[start + 4] !== opcode) throw Error('收到错误的 USB 升级响应')
    const status = buffer[start + 5]
    if (status !== 0) throw Error(`USB 升级指令 ${opcode} 返回错误 ${status}`)
    return buffer.readUInt32LE(start + 8)
  }, opcode === 2 ? 8000 : 3000)
}

async function verifyApp(path) {
  const port = await open(path)
  try {
    await exchange(port, APP_CAPABILITY.subarray(0, 3), bytes =>
      bytes.includes(APP_CAPABILITY) ? true : undefined, 1800)
  } finally { await close(port) }
}

async function updateFirmware(filename, progress = () => {}) {
  const image = await fs.readFile(filename)
  validateImage(image)
  const bootPorts = await list(BOOT_PID)
  if (bootPorts.length > 1) throw Error('检测到多台处于升级模式的键盘')
  const running = await list(APP_PID)
  if (running.length + bootPorts.length > 1) throw Error('请只连接待升级的 MultiPad')
  if (!bootPorts.length && running.length === 1) {
    const port = await open(running[0].path)
    try {
      await exchange(port, APP_CAPABILITY.subarray(0, 3), bytes =>
        bytes.includes(APP_CAPABILITY) ? true : undefined, 1800)
      // The acknowledgement is the device's USB re-enumeration.
      await write(port, Buffer.from([0xaa, 0xbb, 0xf1, 0x55])).catch(() => {})
    } finally { await close(port) }
  }

  const bootPath = await waitForDevice(BOOT_PID)
  progress(`升级设备 ${bootPath}`)
  const boot = await open(bootPath)
  try {
    const limit = await command(boot, 1)
    if (limit !== MAX_IMAGE) throw Error('设备 Flash 布局与该固件不匹配')
    const checksum = crc32(image)
    const declared = await command(boot, 2, image.length, checksum)
    if (declared !== image.length) throw Error('设备确认的固件长度不匹配')
    let nextProgress = 10
    for (let offset = 0; offset < image.length; offset += PAYLOAD) {
      const block = image.subarray(offset, Math.min(offset + PAYLOAD, image.length))
      const next = await command(boot, 3, offset, 0, block)
      if (next !== offset + block.length) throw Error('升级过程中地址未对齐')
      if (next * 100 / image.length >= nextProgress) {
        progress(`已传输 ${nextProgress}%`)
        nextProgress += 10
      }
    }
    await command(boot, 4)
    progress('设备已校验暂存区，正在写入应用 Flash')
    await command(boot, 5)
  } finally { await close(boot) }
  const path = await waitForDevice(APP_PID, 25)
  await verifyApp(path)
  progress(`升级后键盘重新连接 ${path}`)
  return path
}

module.exports = {updateFirmware}

if (require.main === module) {
  if (process.argv.length !== 3) {
    console.error('用法：node scripts/firmware-update.cjs <usb-app/leden.bin>')
    process.exitCode = 1
  } else {
    updateFirmware(process.argv[2], console.log).catch(error => {
      console.error(error.message)
      process.exitCode = 1
    })
  }
}
