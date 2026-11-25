import { DEVICE_SCREEN_SIZES, type DeviceScreens } from '../../src/utils/deviceScreenFormat'
import type { DeviceButtons } from '../../src/utils/deviceButtonState'
import { isStatCommand, isStatValue, isHeadPetInput, isHutchPosition, petStateGeneration } from '../../src/utils/petCatalog'

const REQUEST_MAGIC = Buffer.from([0xaa, 0xbb, 0xc1, 0x53])
const RESPONSE_MAGIC = Buffer.from([0x4d, 0x50, 0x53, 1])
const HEADER_SIZE = 19
const MAX_CHUNK = 224
const BUTTON_STATE = 0xfe
const INFO = 0xff
const STATUS_OK = 0
const STATUS_EMPTY = 1
const PET_CONTROL = 0xfa
const PET_EVENTS = 0xfb

export type PetRequest = { command: number; value: number } | { after: number }
export type PetReply =
  | { state: 'ready'; status: number; payload: Buffer }
  | { state: 'busy' | 'unavailable' | 'unsupported' | 'disconnected' }

function crc16(bytes: Buffer) {
  let crc = 0xffff
  for (const byte of bytes) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ (crc & 0x8000 ? 0x1021 : 0)) & 0xffff
  }
  return crc
}

export default class ScreenReadback {
  private sequence = 0
  private buffer = Buffer.alloc(0)
  private pending?: { id: number; finish: (frame?: Buffer) => void }
  private reading = false
  private closed = false
  private delivered?: number
  private buttonSampleRequested = false
  private heldButtons?: number
  private pressedButtons = 0
  private petGeneration?: number

  constructor(
    private readonly write: (data: Buffer) => Promise<boolean>,
    private readonly supportsButtons = false
  ) {}

  get busy() {
    return this.reading || this.pending !== undefined
  }

  close() {
    this.closed = true
    this.pending?.finish()
  }

  accept(chunk: Buffer) {
    if (!this.pending) return
    this.buffer = Buffer.concat([this.buffer, chunk])
    while (this.pending) {
      const start = this.buffer.indexOf(RESPONSE_MAGIC)
      if (start < 0) {
        this.buffer = this.buffer.subarray(-3)
        return
      }
      this.buffer = this.buffer.subarray(start)
      if (this.buffer.length < HEADER_SIZE) return
      const payloadSize = this.buffer.readUInt16LE(16)
      if (payloadSize > MAX_CHUNK) {
        this.buffer = this.buffer.subarray(1)
        continue
      }
      const frameSize = HEADER_SIZE + payloadSize + 2
      if (this.buffer.length < frameSize) return
      const frame = this.buffer.subarray(0, frameSize - 2)
      if (crc16(frame) !== this.buffer.readUInt16LE(frameSize - 2)) {
        this.buffer = this.buffer.subarray(1)
        continue
      }
      this.buffer = this.buffer.subarray(frameSize)
      if (frame.readUInt16LE(4) === this.pending.id) this.pending.finish(frame)
    }
  }

  private async exchange(screen: number, generation = 0, offset = 0, length = 0) {
    if (this.closed) return
    const id = this.sequence = this.sequence % 65535 + 1
    const request = Buffer.alloc(17)
    REQUEST_MAGIC.copy(request)
    request.writeUInt16LE(id, 4)
    request.writeUInt32LE(generation, 6)
    request[10] = screen
    request.writeUInt32LE(offset, 11)
    request.writeUInt16LE(length, 15)

    return new Promise<Buffer | undefined>((resolve) => {
      const finish = (frame?: Buffer) => {
        if (this.pending?.id !== id) return
        clearTimeout(timer)
        this.pending = undefined
        resolve(frame)
      }
      const timer = setTimeout(finish, 600)
      this.buffer = Buffer.alloc(0)
      this.pending = { id, finish }
      this.write(request).then((written) => {
        if (!written) finish()
      }).catch(() => finish())
    })
  }

  private async sampleButtons() {
    this.buttonSampleRequested = false
    const frame = await this.exchange(BUTTON_STATE)
    if (!frame || frame[6] !== STATUS_OK || frame[7] !== BUTTON_STATE || frame.length !== HEADER_SIZE + 4) {
      this.heldButtons = undefined
      this.pressedButtons = 0
      return
    }
    // Ignore historical taps in the first sample after connecting, but report held keys.
    if (this.heldButtons !== undefined) this.pressedButtons |= frame.readUInt16LE(HEADER_SIZE + 2)
    this.heldButtons = frame.readUInt16LE(HEADER_SIZE)
  }

  async readButtons(): Promise<DeviceButtons> {
    if (!this.supportsButtons) return { state: 'unsupported' }
    if (this.closed) return { state: 'disconnected' }
    if (this.reading) {
      this.buttonSampleRequested = true
      if (this.heldButtons === undefined) return { state: 'busy' }
    } else if (this.pending) {
      return { state: 'busy' }
    } else {
      await this.sampleButtons()
      if (this.closed) return { state: 'disconnected' }
      if (this.heldButtons === undefined) return { state: 'unavailable' }
    }
    const pressed = this.pressedButtons
    this.pressedButtons = 0
    return { state: 'ready', held: this.heldButtons, pressed }
  }

  async performance(menu: number, metrics?: number[]) {
    if (this.closed) return 'disconnected'
    if (this.busy) return 'busy'
    const packed = metrics ? metrics[0] | (metrics[1] << 8) | (metrics[2] << 16) : 0
    const frame = await this.exchange(0xf9, packed, menu)
    if (!frame || frame[7] !== 0xf9) return 'unavailable'
    return frame[6] === STATUS_OK ? 'ready' : 'busy'
  }

  async readPet(request: PetRequest): Promise<PetReply> {
    if (this.closed) return { state: 'disconnected' }
    if (this.busy) return { state: 'busy' }
    if ('after' in request) return this.petExchange(PET_EVENTS, request.after, 0)
    this.reading = true
    try {
      if (this.petGeneration === undefined) {
        // Older boards answer an unknown generation with the 12-byte layout.
        // Try each known generation with reads before sending any mutation.
        let requested = 10
        let probe = await this.petExchange(PET_CONTROL, requested, 0)
        while (probe.state === 'ready' && probe.status === STATUS_OK && probe.payload.length === 12 && requested > 2) {
          probe = await this.petExchange(PET_CONTROL, --requested, 0)
        }
        if (probe.state !== 'ready' || probe.status !== STATUS_OK) return probe
        const generation = petStateGeneration(probe.payload)
        if (!generation) return { state: 'unavailable' }
        this.petGeneration = generation
        if (!request.command) return probe
      }
      const { command, value } = request
      if (isStatCommand(command) && this.petGeneration < 10) return { state: 'unsupported' }
      if (isStatCommand(command) && !isStatValue(value)) return { state: 'unavailable' }
      if ((command === 3 && value >= 16 && this.petGeneration < 9) || (command === 3 && value === 15 && this.petGeneration < 8) || (command === 3 && value >= 13 && this.petGeneration < 7) ||
          (this.petGeneration < 6 && command === 22 && value > 4) || (this.petGeneration < 5 && command === 22) || (this.petGeneration < 4 && command >= 14) ||
          (this.petGeneration < 3 && (command >= 8 || (command === 7 && value > 1)))) {
        return { state: 'unsupported' }
      }
      if (command === 14 && (!Number.isInteger(value) || value < 0 || value > 0x1ffff ||
          !isHutchPosition(value & 511, value >> 9))) return { state: 'unavailable' }
      if (command === 22 && !isHeadPetInput(value)) return { state: 'unavailable' }
      const opcode = command === 10 ? 16 + (value >> 8) : command
      const offset = opcode | ((command === 14 ? value : value & 255) << 8)
      const reply = await this.petExchange(PET_CONTROL, this.petGeneration === 1 ? 0 : this.petGeneration, offset)
      if (reply.state === 'ready' && reply.status === STATUS_OK &&
          petStateGeneration(reply.payload) !== this.petGeneration) return { state: 'unavailable' }
      return reply
    } finally {
      this.reading = false
    }
  }

  private async petExchange(screen: number, generation: number, offset: number): Promise<PetReply> {
    const frame = await this.exchange(screen, generation, offset)
    if (!frame || frame[7] !== screen || frame.readUInt32LE(12) !== offset) {
      return { state: this.closed ? 'disconnected' : 'unavailable' }
    }
    return { state: 'ready', status: frame[6], payload: frame.subarray(HEADER_SIZE) }
  }

  async read(knownGeneration?: number): Promise<DeviceScreens> {
    if (this.closed) return { state: 'disconnected' }
    if (this.busy) return { state: 'busy' }
    this.reading = true
    try {
      const info = await this.exchange(INFO)
      if (!info || info[7] !== INFO) return { state: this.closed ? 'disconnected' : 'unavailable' }
      if (info[6] === STATUS_EMPTY) return { state: 'empty' }
      const generation = info.readUInt32LE(8)
      const menu = info[18]
      if (info[6] !== STATUS_OK || menu < 1 || menu > 10) return { state: 'unavailable' }
      if (generation === knownGeneration && generation === this.delivered) return { state: 'unchanged' }

      const pixels = []
      for (const [screen, { bytes }] of DEVICE_SCREEN_SIZES.entries()) {
        const image = new Uint8Array(bytes)
        for (let offset = 0; offset < bytes; offset += MAX_CHUNK) {
          if (this.buttonSampleRequested) await this.sampleButtons()
          const length = Math.min(MAX_CHUNK, bytes - offset)
          const frame = await this.exchange(screen, generation, offset, length)
          if (!frame) return { state: this.closed ? 'disconnected' : 'unavailable' }
          if (frame[6] !== STATUS_OK || frame[18] !== menu || frame.readUInt32LE(8) !== generation) {
            return { state: 'busy' }
          }
          if (frame[7] !== screen || frame.readUInt32LE(12) !== offset || frame.length !== HEADER_SIZE + length) {
            return { state: 'unavailable' }
          }
          image.set(frame.subarray(HEADER_SIZE), offset)
        }
        pixels.push(image)
      }
      const latest = await this.exchange(INFO)
      if (!latest || latest[6] !== STATUS_OK || latest[18] !== menu || latest.readUInt32LE(8) !== generation) {
        return { state: 'busy' }
      }

      this.delivered = generation
      return { state: 'ready', menu, generation, pixels }
    } finally {
      this.reading = false
    }
  }
}
