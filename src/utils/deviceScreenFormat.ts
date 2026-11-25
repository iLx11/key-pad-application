export const DEVICE_SCREEN_SIZES = [
  { width: 320, height: 172, bytes: 110080 },
  { width: 72, height: 40, bytes: 360 },
  { width: 72, height: 40, bytes: 360 },
] as const

export type DeviceScreens =
  | { state: 'ready'; menu: number; generation: number; pixels: Uint8Array[] }
  | { state: 'unchanged' | 'empty' | 'busy' | 'unavailable' | 'unsupported' | 'disconnected' }

export function renderDeviceScreens(screens: Uint8Array[]) {
  return DEVICE_SCREEN_SIZES.map(({ width, height }, index) => {
    const source = screens[index]
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')!
    const image = context.createImageData(width, height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = y * width + x
        const output = pixel * 4
        if (index === 0) {
          const value = (source[pixel * 2] << 8) | source[pixel * 2 + 1]
          image.data[output] = Math.round(((value >> 11) & 31) * 255 / 31)
          image.data[output + 1] = Math.round(((value >> 5) & 63) * 255 / 63)
          image.data[output + 2] = Math.round((value & 31) * 255 / 31)
        } else {
          const pageByte = source[Math.floor(y / 8) * width + x]
          const gray = pageByte & (1 << (y % 8)) ? 255 : 0
          image.data.fill(gray, output, output + 3)
        }
        image.data[output + 3] = 255
      }
    }
    context.putImageData(image, 0, 0)
    return canvas.toDataURL()
  })
}
