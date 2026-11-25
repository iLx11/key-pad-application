import type { SerialPort as SerialPortInstance } from 'serialport'
import type { DeviceButtons } from '../../src/utils/deviceButtonState'
import type { DeviceScreens } from '../../src/utils/deviceScreenFormat'
import ScreenReadback, { type PetReply, type PetRequest } from './screenReadback'
import { randomUUID } from 'node:crypto'
import { exchangeLiveOled } from './liveOled'

const { SerialPort }: typeof import('serialport') = require('serialport')
const HANDSHAKE = Buffer.from([0xaa, 0xbb, 0xcc])
const READBACK_CAPABILITY = Buffer.from([0xaa, 0xbb, 0xcc, 0x4d, 0x50, 0x53, 0x43, 1])
const BUTTON_CAPABILITY = 0x4b
const UPDATE_CAPABILITY = 0x55
const LIVE_OLED_CAPABILITY = 0x4c
const PET_API_CAPABILITY = 0x50

export default class SerialConnect {
  private static port?: SerialPortInstance
  private static connectionAttempt?: Promise<boolean>
  private static screenReadback?: ScreenReadback
  private static waitState = false
  private static upgrading = false
  private static configuring = false
  private static petSession?: string
  private static performanceSupported = false
  private static liveOledSupported = false
  private static liveOledTask?: Promise<Awaited<ReturnType<typeof exchangeLiveOled>>>

  static connectHardware(): Promise<boolean> {
    if (this.upgrading) return Promise.resolve(false)
    if (this.port?.isOpen) return Promise.resolve(true)
    if (!this.connectionAttempt) {
      this.connectionAttempt = this.findHardware().finally(() => { this.connectionAttempt = undefined })
    }
    return this.connectionAttempt
  }

  static async withFirmwareUpdate<T>(run: () => Promise<T>): Promise<T> {
    if (this.upgrading || this.configuring) throw Error('键盘正在传输数据')
    this.upgrading = true
    try {
      await this.connectionAttempt
      await this.liveOledTask?.catch(() => undefined)
      const port = this.port
      this.screenReadback?.close()
      this.screenReadback = undefined
      this.liveOledSupported = false
      this.petSession = undefined
      this.port = undefined
      this.waitState = false
      if (port?.isOpen) await new Promise<void>((resolve, reject) =>
        port.close(error => error ? reject(error) : resolve()))
      return await run()
    } finally {
      this.upgrading = false
    }
  }

  private static async findHardware() {
    try {
      const ports = await SerialPort.list()
      const address = (port: (typeof ports)[number]) =>
        `${port.vendorId}:${port.productId}`.toUpperCase()
      const knownKeyboards = ports.filter(port => ['07CF:4F0F', '5688:5966'].includes(address(port)))
      if (!knownKeyboards.length && ports.some(port => address(port) === '07CF:4F10')) {
        // A bootloader connection belongs to the updater, even during recovery.
        return false
      }
      const candidates = knownKeyboards.length ? knownKeyboards : ports
      // Try USB devices before virtual serial ports.
      candidates.sort((a, b) => Number(Boolean(b.vendorId)) - Number(Boolean(a.vendorId)))
      for (const candidate of candidates) {
        const port = new SerialPort({ path: candidate.path, baudRate: 115200, autoOpen: false })
        const disconnect = () => {
          if (this.port !== port) return
          this.screenReadback?.close()
          this.port = undefined
          this.screenReadback = undefined
          this.liveOledSupported = false
          this.petSession = undefined
          this.waitState = false
          if (port.isOpen) port.close(() => {})
        }
        port.on('error', disconnect)
        port.on('close', disconnect)

        const opened = await new Promise<boolean>((resolve) => port.open(error => resolve(!error)))
        if (!opened) continue

        let reply = Buffer.alloc(0)
        const collectHandshake = (chunk: Buffer) => {
          reply = Buffer.concat([reply, chunk]).subarray(-32)
        }
        port.on('data', collectHandshake)
        const sent = await this.writePort(port, HANDSHAKE)
        if (sent) await new Promise((resolve) => setTimeout(resolve, 500))
        port.off('data', collectHandshake)

        if (!port.isOpen || !reply.includes(HANDSHAKE)) {
          if (port.isOpen) await new Promise<void>((resolve) => port.close(() => resolve()))
          continue
        }

        this.port = port
        const capabilityStart = reply.indexOf(READBACK_CAPABILITY)
        if (capabilityStart !== -1) {
          const suffix = reply.subarray(capabilityStart + READBACK_CAPABILITY.length)
          const buttonFlag = suffix[0] === UPDATE_CAPABILITY ? suffix[1] : suffix[0]
          this.performanceSupported = suffix.includes(0x56)
          this.liveOledSupported = suffix.includes(LIVE_OLED_CAPABILITY)
          this.petSession = suffix.includes(PET_API_CAPABILITY) ? randomUUID() : undefined
          this.screenReadback = new ScreenReadback(
            (data) => this.writePort(port, data), buttonFlag === BUTTON_CAPABILITY
          )
        }
        port.on('data', (chunk: Buffer) => {
          if (this.port !== port) return
          if (this.screenReadback?.busy) this.screenReadback.accept(chunk)
          else if (chunk[0] === 0x77) this.waitState = true
        })
        console.info('connect success', candidate.path)
        return true
      }
    } catch (error) {
      console.error(error)
    }
    return false
  }

  static async readDeviceScreens(knownGeneration?: number): Promise<DeviceScreens> {
    if (!this.port?.isOpen) return { state: 'disconnected' }
    if (!this.screenReadback) return { state: 'unsupported' }
    if (this.liveOledTask || this.configuring) return { state: 'busy' }
    return this.screenReadback.read(knownGeneration)
  }

  static async readDeviceButtons(): Promise<DeviceButtons> {
    if (!this.port?.isOpen) return { state: 'disconnected' }
    if (!this.screenReadback) return { state: 'unsupported' }
    if (this.liveOledTask || this.configuring) return { state: 'busy' }
    return this.screenReadback.readButtons()
  }

  static async sendData(data: string | Uint8Array): Promise<boolean> {
    if (!this.port?.isOpen || this.screenReadback?.busy || this.liveOledTask) return false
    return this.writePort(this.port, typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data))
  }

  static async setConfiguring(enabled: boolean) {
    if (!enabled) {
      this.configuring = false
      return
    }
    if (this.upgrading || this.configuring) throw Error('键盘正在传输数据')
    this.configuring = true
    // Prevent new MCP exchanges, then let pending reads finish before the first write.
    const deadline = Date.now() + 2200
    while (this.screenReadback?.busy || this.liveOledTask) {
      if (Date.now() >= deadline) {
        this.configuring = false
        throw Error('键盘正在读取数据，请稍后重试')
      }
      await new Promise(resolve => setTimeout(resolve, 15))
    }
  }

  static async pet(request: PetRequest, cursorSession?: string): Promise<PetReply & { session?: string; reset?: boolean }> {
    if (this.upgrading || this.configuring) return { state: 'busy' }
    if (!await this.connectHardware()) return { state: 'disconnected' }
    const reader = this.screenReadback
    const session = this.petSession
    if (!reader || !session) return { state: 'unsupported' }
    const reset = Boolean(cursorSession && cursorSession !== session)
    if (reset && 'command' in request) return { state: 'disconnected' }
    if (reset && 'after' in request) request = { after: 0 }
    const deadline = Date.now() + 1500
    do {
      if (this.upgrading || this.configuring) return { state: 'busy' }
      if (this.screenReadback !== reader) return { state: 'disconnected' }
      if (!this.liveOledTask) {
        const reply = await reader.readPet(request)
        if (reply.state !== 'busy') return { ...reply, session, reset }
      }
      await new Promise(resolve => setTimeout(resolve, 15))
    } while (Date.now() < deadline)
    return { state: 'busy' }
  }

  static async performance(menu: number, metrics?: number[]) {
    if (!this.port?.isOpen) return 'disconnected'
    if (!this.performanceSupported || !this.screenReadback) return 'unsupported'
    if (this.upgrading || this.configuring || this.liveOledTask) return 'busy'
    if (!Number.isInteger(menu) || menu < 0 || menu > 10 ||
        (menu !== 0 && (!Array.isArray(metrics) || metrics.length !== 3 ||
          [...metrics].some(value => !Number.isInteger(value) || value < 0 || (value > 100 && value !== 255))))) {
      return 'unavailable'
    }
    return this.screenReadback.performance(menu, metrics)
  }

  static async liveOled(operation?: Parameters<typeof exchangeLiveOled>[1]) {
    if (this.upgrading || !this.port?.isOpen) return { state: 'disconnected' }
    if (!this.liveOledSupported) return { state: 'unsupported' }
    if (this.liveOledTask || this.screenReadback?.busy || this.configuring) return { state: 'busy' }
    const task = exchangeLiveOled(this.port, operation)
    this.liveOledTask = task
    try {
      return { state: 'ready', ...await task }
    } catch (error) {
      return { state: 'error', message: error instanceof Error ? error.message : String(error) }
    } finally {
      this.liveOledTask = undefined
    }
  }

  private static writePort(port: SerialPortInstance, data: Buffer): Promise<boolean> {
    if (!port.isOpen) return Promise.resolve(false)
    return new Promise((resolve) => {
      port.write(data, (error) => {
        if (error) {
          resolve(false)
          return
        }
        port.drain((error) => resolve(!error))
      })
    })
  }

  static async waitSign(): Promise<boolean> {
    while (this.port?.isOpen) {
      if (this.waitState) {
        this.waitState = false
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    return false
  }
}
