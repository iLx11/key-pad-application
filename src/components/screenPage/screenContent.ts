export interface PetOledRow {
  label: string
  value: string
  /** Fraction from zero to one; null when a numeric parameter has no reading. */
  progress?: number | null
}

export type ScreenContent =
  | { mode: 'time' | 'date' | 'datetime' }
  | { mode: 'text'; text: string }
  | { mode: 'performance' }
  | { mode: 'pet'; label: string; value: string }
  | { mode: 'pet'; rows: readonly [PetOledRow, PetOledRow] }
  | { mode: 'api'; url: string; field: string; label: string; interval: number }

export interface ScreenFrame {
  baseData: string
  buffData: (number | string)[]
  content?: ScreenContent
}

const win = window as any

// The hardware is monochrome, 72 × 40. Each parameter gets a 20-pixel row.
function renderPetRows(rows: readonly PetOledRow[]) {
  const canvas = document.createElement('canvas')
  canvas.width = 72
  canvas.height = 40
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 72, 40)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  rows.forEach(({ label, value, progress }, index) => {
    const top = index * 20
    const textY = top + (progress === undefined ? 10 : 7)
    ctx.font = 'bold 11px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(label, 1, textY)
    const room = 68 - Math.ceil(ctx.measureText(label).width)
    ctx.textAlign = 'right'
    ctx.fillText(value, 71, textY, room)
    if (progress === undefined) return
    ctx.fillRect(1, top + 14, 70, 5)
    ctx.fillStyle = '#000'
    ctx.fillRect(2, top + 15, 68, 3)
    ctx.fillStyle = '#fff'
    if (progress != null && Number.isFinite(progress)) {
      ctx.fillRect(2, top + 15, Math.round(68 * Math.max(0, Math.min(1, progress))), 3)
    }
  })
  return canvas.toDataURL('image/png')
}

export async function renderScreenContent(content: ScreenContent, now = new Date()): Promise<string> {
  const twoDigits = (value: number) => String(value).padStart(2, '0')
  const time = `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}`
  const date = `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}`
  const weekday = '日一二三四五六'[now.getDay()]
  let lines: string[]
  switch (content.mode) {
    case 'time':
      lines = [time]
      break
    case 'date':
      lines = [date, `星期${weekday}`]
      break
    case 'datetime':
      lines = [time, date]
      break
    case 'text':
      lines = content.text.trim().split(/\r?\n/, 2)
      if (!lines[0]) throw new Error('请输入文字')
      break
    case 'performance':
      throw new Error('性能监测仅用于彩屏')
    case 'pet':
      if ('rows' in content) return renderPetRows(content.rows)
      lines = [content.label, content.value]
      break
    case 'api': {
      const result = await win.myApi.fetchScreenValue(content.url, content.field)
      if (!result.ok) throw new Error(result.error)
      lines = content.label ? [content.label, result.value] : [result.value]
      break
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = 72
  canvas.height = 40
  const context = canvas.getContext('2d')!
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#fff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  lines.forEach((text, index) => {
    const primary = lines.length === 1 || (content.mode === 'api' || content.mode === 'pet' ? index === 1 : index === 0)
    const maxSize = primary ? (lines.length === 1 ? 23 : 18) : 11
    const y = lines.length === 1 ? 20 : index === 0 ? 11 : 29
    let size = maxSize
    const setFont = () => { context.font = `bold ${size}px "Microsoft YaHei", sans-serif` }
    setFont()
    while (size > 9 && context.measureText(text).width > 68) {
      size--
      setFont()
    }
    let characters = Array.from(text)
    while (context.measureText(characters.join('')).width > 68) {
      characters.splice(-2, 2, '…')
    }
    context.fillText(characters.join(''), 36, y)
  })
  return canvas.toDataURL('image/png')
}

export async function encodeOled(png: string): Promise<ScreenFrame> {
  const baseData = await win.myApi.resizeImage(72, 40, png, 1)
  const buffData = await win.myApi.generateResultArray(baseData, 120, 1, 2, 0, 0, 1)
  if (buffData.length !== 360) throw new Error('小屏像素数据长度错误')
  return { baseData, buffData }
}
