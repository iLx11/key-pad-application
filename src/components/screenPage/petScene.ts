export type PetAction = 'idle' | 'walk' | 'sleep' | 'eat' | 'react' | 'run' | 'flee' | 'blink' |
  'daydream' | 'trip_angry' | 'gaze_owner' | 'stand_watch' | 'inspect_table' | 'binky' | 'groom_fur' | 'groom_ear'

function rect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function pixelCircle(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, radius: number) {
  for (let dy = -radius; dy <= radius; dy++) {
    const half = Math.floor(Math.sqrt(radius * radius - dy * dy))
    rect(ctx, color, x - half, y + dy, half * 2 + 1, 1)
  }
}

function hill(ctx: CanvasRenderingContext2D, color: string, peaks: number[][]) {
  for (let index = 1; index < peaks.length; index++) {
    const [x, y] = peaks[index - 1]
    const [nextX, nextY] = peaks[index]
    for (let column = x; column < nextX; column += 2) {
      const top = Math.round((y + (nextY - y) * (column - x) / (nextX - x)) / 2) * 2
      rect(ctx, color, column, top, 2, 142 - top)
    }
  }
}

function tree(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  rect(ctx, '#506e66', x - 2, y, 4, 31)
  pixelCircle(ctx, color, x - 7, y + 6, 11)
  pixelCircle(ctx, color, x + 8, y + 5, 12)
  pixelCircle(ctx, color, x + 1, y - 5, 15)
  rect(ctx, '#83a37a', x - 7, y - 10, 6, 2)
  rect(ctx, '#83a37a', x - 9, y - 8, 2, 4)
}

export function drawGarden(ctx: CanvasRenderingContext2D) {
  rect(ctx, '#f6c19e', 0, 0, 320, 172)
  rect(ctx, '#efac99', 0, 0, 320, 23)
  rect(ctx, '#f3b49b', 0, 23, 320, 21)
  rect(ctx, '#f9cda4', 0, 66, 320, 33)
  pixelCircle(ctx, '#ffe7b1', 237, 54, 21)
  for (const [x, y, width] of [[23, 38, 40], [99, 60, 45], [279, 28, 27]]) {
    rect(ctx, '#ffdbb2', x, y, width, 3)
    rect(ctx, '#ffdbb2', x + 8, y - 3, width - 19, 3)
    rect(ctx, '#fbe0b7', x + 5, y + 3, width - 9, 2)
  }
  hill(ctx, '#d39291', [[0, 105], [22, 96], [44, 80], [62, 83], [104, 100], [135, 98], [168, 79], [185, 82], [219, 105], [270, 93], [297, 78], [320, 92]])
  hill(ctx, '#af8291', [[0, 112], [39, 103], [70, 107], [105, 122], [150, 113], [174, 106], [196, 108], [227, 120], [261, 108], [295, 102], [320, 109]])
  hill(ctx, '#858f87', [[0, 128], [43, 120], [85, 126], [140, 129], [179, 120], [217, 128], [280, 117], [320, 124]])
  tree(ctx, 22, 110, '#668c76')
  tree(ctx, 294, 108, '#628772')
  rect(ctx, '#799866', 0, 138, 320, 34)
  rect(ctx, '#95a978', 0, 140, 320, 3)
  rect(ctx, '#678460', 0, 159, 320, 13)
  rect(ctx, '#5a7459', 0, 169, 320, 3)
  for (const [x, y] of [[10, 147], [31, 156], [60, 150], [96, 162], [129, 150], [160, 155], [198, 151], [222, 163], [246, 156], [281, 148], [305, 160]]) {
    rect(ctx, '#527057', x, y, 2, 4)
    rect(ctx, '#527057', x + 2, y + 2, 3, 2)
    rect(ctx, '#a4b47c', x + 6, y + 4, 4, 1)
  }
  for (const [x, y] of [[37, 146], [71, 155], [176, 150], [251, 146], [290, 155]]) {
    rect(ctx, '#526d55', x, y, 2, 5)
    rect(ctx, '#ffd39e', x - 2, y - 2, 6, 3)
    rect(ctx, '#f7a78a', x, y - 3, 2, 4)
  }
}

// Draw an ellipse as horizontal pixel spans so the LCD asset and canvas use the same grid.
function nurseryOval(ctx: CanvasRenderingContext2D, color: string, cx: number, cy: number, rx: number, ry: number) {
  for (let dy = -ry; dy <= ry; dy++) {
    const half = Math.round(rx * Math.sqrt(1 - dy * dy / (ry * ry)))
    rect(ctx, color, cx - half, cy + dy, 2 * half + 1, 1)
  }
}

// The generator uses these five colours as material IDs for the two sky bands, clouds and trees.
export const windowMaterials = ['#a7d4dd', '#bee1e1', '#f3f6e7', '#adcbbb', '#a7c4ae']
const windowKeyframes = [
  [0,  '#233254', '#435376', '#536481', '#34475b', '#293e4d'],
  [5,  '#49517b', '#c48e97', '#a395ab', '#5b6878', '#4c6266'],
  [7,  '#f1b59d', '#ffe1af', '#fff0d6', '#9dae91', '#859d86'],
  [10, ...windowMaterials],
  [15, '#82b9df', '#c5e7e9', '#f7f5e5', '#96bb99', '#81ab91'],
  [18, '#d99bae', '#ffcb94', '#f9ddd2', '#959686', '#798b79'],
  [20, '#57537f', '#b18596', '#92809c', '#60657b', '#505a6c'],
  [22, '#263959', '#485779', '#596986', '#35495b', '#2e4251'],
  [24, '#233254', '#435376', '#536481', '#34475b', '#293e4d']
] as const
export const windowStars = [[104,27],[119,35],[128,22],[134,50],[148,28],[157,38],[171,25],[177,55]] as const

export function windowPalette(hour: number, minute: number) {
  const time = hour + minute / 60
  const hi = windowKeyframes.findIndex(row => row[0] > time)
  const a = windowKeyframes[hi - 1], b = windowKeyframes[hi]
  const weight = (time - a[0]) / (b[0] - a[0])
  return windowMaterials.map((_, i) => {
    const left = parseInt(String(a[i + 1]).slice(1), 16), right = parseInt(String(b[i + 1]).slice(1), 16)
    const channels = [16,8,0].map(shift => Math.round(((left >> shift) & 255) * (1 - weight) + ((right >> shift) & 255) * weight))
    return '#' + channels.map(c => c.toString(16).padStart(2, '0')).join('')
  })
}

export function drawNursery(ctx: CanvasRenderingContext2D, hour = 12, minute = 0, materialsOnly = false) {
  const paint = (color: string, x: number, y: number, w: number, h: number) => rect(ctx, color, x, y, w, h)
  const oval = (color: string, x: number, y: number, rx: number, ry: number) => nurseryOval(ctx, color, x, y, rx, ry)
  const honey = '#c99470', maple = '#e1b181', mapleLight = '#f4d5a8'
  const cream = '#fff0cf', peach = '#efb4a2', rose = '#cb8b80'
  const mint = '#9bc7b8', teal = '#78a99d'

  // Daisies on buttercream wallpaper, above a low honey-oak skirting board.
  paint('#fae6cc', 0, 0, 320, 172)
  for (let y = 14; y < 105; y += 27) {
    for (let x = (y % 2 ? 9 : 24); x < 320; x += 32) {
      paint('#f1d6bd', x, y, 1, 3)
      paint('#f1d6bd', x - 1, y + 1, 3, 1)
    }
  }
  paint('#f2d9bc', 0, 103, 320, 8)
  paint('#fff1d7', 0, 106, 320, 2)
  paint(mapleLight, 0, 109, 320, 5)
  paint('#d5ad8d', 0, 114, 320, 2)
  paint('#f1d3ad', 0, 116, 320, 56)
  for (const [y, seam] of [[126, 49], [147, 18], [166, 76]]) {
    paint('#e5c19f', 0, y, 320, 1)
    for (let x = seam; x < 320; x += 98) paint('#e5c19f', x, y + 1, 1, 18)
  }

  // Wide window with tied linen curtains, a bright sky and trees beyond the sill.
  paint('#e5c6a8', 87, 15, 106, 66)
  paint(honey, 90, 12, 100, 65)
  paint(mapleLight, 91, 13, 98, 63)
  const [sky, horizon, cloud, trees, meadow] = materialsOnly ? windowMaterials : windowPalette(hour, minute)
  paint(sky, 96, 17, 88, 54)
  paint(horizon, 96, 40, 88, 31)
  if (!materialsOnly) {
    const night = hour < 6 || hour >= 19
    const t = ((hour * 60 + minute - (night ? 1140 : 360) + 1440) % 1440) / (night ? 660 : 780)
    const cx = 99 + Math.round(80 * t), cy = 63 - Math.round(144 * t * (1 - t))
    if (night) {
      for (const [sx, sy] of windowStars) paint('#fff0c6', sx, sy, 2, 1)
    }
    for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) {
      const d = dx * dx + dy * dy
      if (cx + dx < 96 || cx + dx >= 184 || cy + dy < 17 || cy + dy >= 71) continue
      if (d <= (night ? 42 : 64) && (!night || (dx - 3) ** 2 + (dy + 2) ** 2 > 30))
        paint(night ? '#ffebc1' : d <= 40 ? '#fff1bf' : '#ffd68e', cx + dx, cy + dy, 1, 1)
    }
  }
  for (const [x, y] of [[111, 32], [169, 47]]) {
    paint(cloud, x, y, 12, 2)
    paint(cloud, x + 3, y - 2, 6, 2)
  }
  for (const [cx, cy, radius] of [[102, 67, 6], [113, 68, 7], [124, 68, 5], [154, 69, 4], [175, 65, 6]]) {
    pixelCircle(ctx, trees, cx, cy, radius)
  }
  paint(meadow, 96, 68, 88, 3)
  paint('#faf0d7', 137, 16, 4, 56)
  paint('#faf0d7', 95, 44, 90, 3)
  paint('#d8b898', 141, 16, 1, 56)
  paint(maple, 83, 74, 114, 5)
  paint('#ffebc6', 83, 74, 114, 2)
  paint(honey, 85, 79, 110, 2)
  for (let y = 12; y <= 73; y++) {
    const width = y < 49 ? 20 - Math.floor((y - 12) / 3) : 8 + Math.floor((y - 49) / 4)
    for (const side of [0, 1]) {
      const left = side ? 196 - width : 83
      paint(rose, left, y, width, 1)
      paint(peach, left + 1, y, width - 2, 1)
      paint('#f7c9b4', side ? left + 2 : left + width - 5, y, 2, 1)
    }
  }
  for (const x of [82, 187]) {
    paint('#b98866', x, 48, 10, 3)
    paint('#f6d596', x, 48, 9, 1)
  }
  paint(honey, 79, 9, 121, 3)
  pixelCircle(ctx, maple, 79, 10, 3)
  pixelCircle(ctx, maple, 200, 10, 3)

  // A tiny framed rainbow above a low shelf within a child's reach.
  paint('#e8c9ad', 22, 32, 36, 29)
  paint(honey, 20, 30, 36, 29)
  paint(mapleLight, 21, 31, 34, 27)
  paint(cream, 23, 33, 30, 23)
  for (const [radius, color] of [[10, '#dd998b'], [8, '#efc680'], [6, mint], [4, cream]] as const) {
    for (let dy = -radius; dy <= 0; dy++) {
      const half = Math.floor(Math.sqrt(radius * radius - dy * dy))
      paint(color, 38 - half, 50 + dy, half * 2 + 1, 1)
    }
  }
  paint('#f4d9b9', 26, 51, 7, 1)
  paint('#f4d9b9', 43, 51, 7, 1)
  oval('#dfaF8d', 44, 123, 39, 3)
  paint(honey, 8, 96, 74, 27)
  paint(maple, 9, 97, 72, 25)
  paint('#c39775', 13, 99, 65, 19)
  paint('#d8ad88', 14, 100, 64, 17)
  paint(mapleLight, 7, 93, 76, 3)
  paint(honey, 7, 96, 76, 2)
  paint(mapleLight, 10, 118, 69, 3)
  paint(mapleLight, 44, 98, 3, 21)
  for (const [x, height, color] of [[16, 14, teal], [21, 16, peach], [26, 12, cream], [31, 15, '#b6a6c5']] as const) {
    paint(color, x, 118 - height, 4, height)
    paint('#f8dfc1', x, 120 - height, 3, 1)
  }
  paint('#b57e68', 51, 106, 23, 12)
  paint(peach, 52, 106, 21, 11)
  paint('#f9d2bc', 50, 104, 25, 3)
  paint('#a87867', 59, 108, 7, 2)
  // Seated teddy and a wooden stacking-ring toy.
  oval('#d2a07d', 27, 91, 14, 2)
  for (const x of [19, 34]) {
    pixelCircle(ctx, '#b67f60', x, 71, 4)
    pixelCircle(ctx, '#e8b887', x, 71, 2)
  }
  oval('#bb8566', 27, 85, 8, 8)
  oval('#dcab7c', 27, 85, 7, 7)
  oval('#f0cd98', 27, 86, 4, 4)
  for (const x of [19, 35]) oval('#c99370', x, 85, 3, 5)
  for (const x of [21, 32]) oval('#b98060', x, 91, 4, 2)
  oval('#bd8667', 27, 76, 10, 9)
  oval('#dfad7f', 27, 75, 9, 8)
  oval('#f1cfa0', 27, 78, 5, 3)
  paint('#76554e', 22, 74, 2, 2)
  paint('#76554e', 30, 74, 2, 2)
  paint('#886453', 26, 77, 3, 2)
  paint('#97b7ab', 23, 82, 8, 2)
  paint(maple, 53, 89, 22, 4)
  paint('#b5a2c0', 54, 86, 20, 4)
  paint(mint, 56, 82, 16, 4)
  paint('#e7bd7e', 58, 78, 12, 4)
  paint(peach, 60, 75, 8, 3)
  pixelCircle(ctx, cream, 64, 73, 2)

  // A wooden moon-and-stars mobile above the nest.
  paint('#bfa085', 246, 0, 1, 17)
  paint(honey, 225, 18, 43, 2)
  paint(honey, 233, 16, 27, 2)
  paint(honey, 241, 14, 11, 2)
  for (const [x, y] of [[227, 34], [247, 42], [265, 31]]) {
    paint('#c3a58e', x, 20, 1, y - 19)
    if (x === 247) {
      pixelCircle(ctx, '#e4b769', x, y, 6)
      pixelCircle(ctx, '#fae6cc', x + 3, y - 2, 5)
    } else {
      paint(x === 227 ? peach : mint, x - 1, y - 3, 3, 8)
      paint(x === 227 ? peach : mint, x - 4, y, 9, 2)
      paint(x === 227 ? peach : mint, x - 2, y + 2, 5, 1)
    }
  }

  // Braided oval play mat; the centre is open for the rabbit to roam.
  oval('#ddba9e', 160, 150, 101, 15)
  oval('#92b8ab', 159, 148, 101, 16)
  oval('#bedac5', 159, 147, 98, 15)
  oval('#93bcae', 159, 147, 90, 12)
  oval('#c7dfca', 159, 147, 87, 11)
  for (const x of [106, 130, 154, 178, 202]) {
    paint('#a9cdb9', x, 153, 3, 1)
    paint('#dfebd0', x + 1, 152, 1, 3)
  }
}

export function drawNurseryHutch(ctx: CanvasRenderingContext2D) {
  const paint = (color: string, x: number, y: number, w: number, h: number) => rect(ctx, color, x, y, w, h)
  const oval = (color: string, x: number, y: number, rx: number, ry: number) => nurseryOval(ctx, color, x, y, rx, ry)
  // Padded rabbit bed with a curved hood, stitched ears and a blush seat cushion.
  oval('#dbb698', 246, 139, 35, 5)
  for (const x of [224, 267]) {
    oval('#ad958c', x, 85, 5, 10)
    oval('#e5bbad', x, 84, 4, 9)
    oval('#f2d7ba', x, 84, 2, 6)
  }
  oval('#b98e82', 246, 114, 34, 34)
  oval('#e9b3a2', 246, 114, 32, 32)
  oval('#f4cdb7', 245, 113, 29, 31)
  paint('#b98e82', 212, 114, 69, 22)
  paint('#e9b3a2', 214, 114, 65, 22)
  oval('#d39084', 246, 117, 25, 26)
  oval('#9c7975', 246, 118, 23, 25)
  oval('#8b6f70', 246, 119, 21, 23)
  paint('#9c7975', 223, 117, 47, 18)
  paint('#8b6f70', 225, 117, 43, 17)
  for (const [x, y] of [[221, 104], [226, 96], [233, 90], [244, 87], [256, 89], [265, 96], [271, 105]]) {
    paint('#ffe3c7', x, y, 2, 1)
  }
  oval('#c78e80', 246, 137, 34, 7)
  oval('#f1b8a6', 246, 136, 32, 6)
  oval('#f9d3b9', 246, 135, 27, 4)
  drawHutchCushion(ctx)
}

export function drawHutchCushion(ctx: CanvasRenderingContext2D) {
  rect(ctx, '#f8c3ae', 226, 136, 40, 2)
  rect(ctx, '#c38277', 226, 138, 40, 2)
}

const carrotRows = [
  '......g.g.', '......gg.g', '....xxggg.', '...xhhfx..', '..xhffffx.',
  '.xfffffx..', '.xfffx....', 'xfffx.....', 'xxx.......'
]
const carrotColors: Record<string, string> = { g: '#60996c', h: '#ffcc80', f: '#f29a57', x: '#a7654a' }
const carrotMotion = [[0, 0], [2, -3], [4, -2], [2, 0]]

export function drawCarrotToy(ctx: CanvasRenderingContext2D, nudging: boolean, elapsed: number) {
  const [dx, dy] = carrotMotion[nudging ? Math.floor(elapsed / 120) % 4 : 0]
  carrotRows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = carrotColors[row[x]]
      if (color) rect(ctx, color, 165 + dx + x * 2, 123 + dy + y * 2, 2, 2)
    }
  })
}

const clockDigits = [0x7b6f, 0x2c97, 0x73e7, 0x73cf, 0x5bc9, 0x79cf, 0x79ef, 0x7249, 0x7bef, 0x7bcf]

export function drawSceneClock(ctx: CanvasRenderingContext2D, hour: number, minute: number) {
  const digits = [Math.floor(hour / 10), hour % 10, Math.floor(minute / 10), minute % 10]
  rect(ctx, '#3b314b', 8, 8, 49, 19)
  const color = '#ffe8c6'
  const lefts = [15, 23, 35, 43]
  digits.forEach((digit, index) => {
    for (let bit = 0; bit < 15; bit++) {
      if (clockDigits[digit] & (1 << (14 - bit)))
        rect(ctx, color, lefts[index] + 2 * (bit % 3), 12 + 2 * Math.floor(bit / 3), 2, 2)
    }
  })
  rect(ctx, color, 31, 14, 2, 2)
  rect(ctx, color, 31, 18, 2, 2)
}

export function tintNursery(ctx: CanvasRenderingContext2D, hour: number, season: number) {
  const seasonal = ['', '#ffdb82', '#dd975e', '#b6d7f1'][season]
  if (seasonal) rect(ctx, seasonal + '20', 0, 0, 320, 172)
  if (hour >= 20 || hour < 6) rect(ctx, '#3f486a80', 0, 0, 320, 172)
  else if (hour === 6 || hour === 19) rect(ctx, '#3f486a40', 0, 0, 320, 172)
}

// Apply the same time and season lighting as the keyboard, leaving the window frame intact.
export function drawNurseryLight(ctx: CanvasRenderingContext2D, hour: number, season: number) {
  tintNursery(ctx, hour, season)
}

export function drawPetEffects(
  ctx: CanvasRenderingContext2D, x: number, direction: number,
  action: PetAction, elapsed: number, foreground: boolean, showBowl = true
) {
  if (!foreground) {
    rect(ctx, '#587955', x - 23, 138, 46, 3)
    rect(ctx, '#587955', x - 18, 141, 36, 1)
    if (action === 'eat' && showBowl) {
      const bowl = x + direction * 29 - 6
      rect(ctx, '#5b4551', bowl, 134, 12, 5)
      rect(ctx, '#f6b886', bowl + 1, 135, 10, 3)
      rect(ctx, '#68444b', bowl + 5, 132, 4, 2)
    }
    return
  }

  if (action === 'sleep') {
    const lift = Math.floor((elapsed % 1500) / 140)
    const signX = x + direction * 25
    rect(ctx, '#fff0c6', signX, 102 - lift, 6, 2)
    rect(ctx, '#fff0c6', signX + 2, 104 - lift, 2, 2)
    rect(ctx, '#fff0c6', signX, 106 - lift, 6, 2)
  } else if (action === 'react' || action === 'eat') {
    const starX = x + direction * 23
    const starY = (action === 'react' ? 82 : 103) - Math.floor(elapsed / 90) % 5
    rect(ctx, '#fff3c9', starX + 2, starY, 2, 8)
    rect(ctx, '#fff3c9', starX - 1, starY + 3, 8, 2)
  }
}
