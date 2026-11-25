import type { SerialPort } from 'serialport'

const replyMagic = Buffer.from('MPOL')
const chunkSize = 45
let token = 0

interface OledStatus {
  code: number
  menu: number
  mask: number
  generation: number
}

function request(port: SerialPort, screen: number, chunk: number, generation: number, payload?: Uint8Array) {
  const packet = Buffer.alloc(11 + (payload?.length ?? 0))
  packet.set([0xaa, 0xbb, 0xce, 0x44, token++ & 0xff, screen, chunk])
  packet.writeUInt32LE(generation, 7)
  if (payload) packet.set(payload, 11)

  return new Promise<OledStatus>((resolve, reject) => {
    let buffer = Buffer.alloc(0)
    const finish = () => {
      clearTimeout(timeout)
      port.off('data', onData)
      port.off('close', onClose)
    }
    const onClose = () => {
      finish()
      reject(new Error('USB 已断开'))
    }
    const onData = (bytes: Buffer) => {
      buffer = Buffer.concat([buffer, bytes])
      while (buffer.length >= replyMagic.length) {
        const position = buffer.indexOf(replyMagic)
        if (position < 0) {
          buffer = buffer.subarray(-3)
          return
        }
        buffer = buffer.subarray(position)
        if (buffer.length < 12) return
        const reply = buffer.subarray(0, 12)
        buffer = buffer.subarray(12)
        if (reply[4] === packet[4]) {
          finish()
          resolve({ code: reply[5], menu: reply[6], mask: reply[7], generation: reply.readUInt32LE(8) })
          return
        }
      }
    }
    const timeout = setTimeout(() => {
      finish()
      reject(new Error('小屏刷新响应超时'))
    }, 650)
    port.on('data', onData)
    port.once('close', onClose)
    port.write(packet, (error) => {
      if (error) {
        finish()
        reject(error)
      }
    })
  })
}

export async function exchangeLiveOled(port: SerialPort, operation?: {
  screen: number
  generation: number
  pixels?: Uint8Array
}) {
  if (!operation) return request(port, 0, 0, 0)
  const { screen, generation, pixels } = operation
  if ((screen !== 1 && screen !== 2) || !Number.isInteger(generation) || generation < 0 ||
      generation > 0xffffffff || (pixels !== undefined && (!(pixels instanceof Uint8Array) || pixels.length !== 360))) {
    throw new Error('无效的小屏刷新数据')
  }
  if (!pixels) return request(port, screen, 0xff, generation)
  let status: OledStatus
  for (let start = 0; start < pixels.length; start += chunkSize) {
    status = await request(port, screen, start / chunkSize, generation, pixels.subarray(start, start + chunkSize))
    if (status.code !== 0) return status
  }
  return status!
}
