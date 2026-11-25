// Contact points on the forehead of each frost-lop atlas frame, in atlas pixels.
export const rabbitBrows: readonly (readonly [number, number])[] = [
  [37, 14], [35, 14], [38, 17], [37, 3], [41, 8], [37, 15], [33, 22], [38, 21], [38, 21], // original poses
  [38, 18], [37, 17], [38, 17], [41, 18], [37, 14], [41, 15], [38, 16], [40, 18], // walk
  [35, 17], [37, 19], [38, 11], [37, 2], [36, 4], [37, 9], [39, 19], [37, 20], // jump
  [33, 21], [34, 20], [34, 20], [33, 21], // sleep
  [36, 14], [35, 15], [36, 13], [36, 16], // daydream
  [36, 22], [40, 23], [40, 23], [37, 23], // eat
  [36, 16], [37, 13], [38, 13], [42, 14], [40, 13], [40, 19], [39, 15], [36, 16], // run
  [36, 18], [35, 2], [36, 8], [40, 21], [42, 18], [42, 17], [40, 22], [38, 16], // flee
  [37, 16], [43, 19], [44, 21], [43, 28], [46, 29], [31, 13], [31, 11], [31, 12], [31, 11], [31, 11], // trip
  [31, 11], [31, 12], [31, 12], [31, 12], [31, 12], [31, 11], // gaze
  [37, 14], [34, 12], [34, 4], [35, 5], [36, 4], // table reach
  [34, 13], [30, 5], [30, 5], [41, 11], [31, 11], // upright, blink, kick and mid-turn
  [26, 15], [24, 18], // fur grooming
  [37, 14], [37, 14], [37, 14], [35, 14], [35, 14], [35, 14], [35, 14], [37, 14], // original side profile, ear lift and licks
]

export const patWidth = 40, patHeight = 30, patAnchorX = 20, patAnchorY = 24
export const patFrames = 12, patFrameMs = 100
export const patContact = [false, false, true, true, true, true, true, true, true, true, false, false]
export const patTouchPose = rabbitBrows.map((_, id) => {
  if (id === 0 || (id >= 29 && id <= 32)) return 1 // side-on blink
  if (id >= 63 && id <= 68) return 66 // eyes closed, facing the owner
  return id
})

export function patPhase(ageMs: number, remainingMs: number) {
  if (remainingMs <= 200) return remainingMs <= 100 ? 11 : 10
  const tick = Math.max(0, Math.floor(ageMs / patFrameMs))
  return tick < 2 ? tick : 2 + (tick - 2) % 8
}

// A side view of the owner's hand. The last rows are the fingertips resting on the fur.
const hand = [
  '              oooo  ',
  '             ocCCco ',
  '            ocCcccco',
  '           osoccccto',
  '       oooohhsoocco ',
  '     oolhhhhhlsooo  ',
  '   oolhhllhhhhhso   ',
  '  ohhhlsslhhhhlso   ',
  ' ollhhsooohhhllo    ',
  ' ohhlso  ollsoho    ',
  ' ohso   oshsohso    ',
  '  oo    ohso olo    ',
  '        oso  oo     ',
  '         o          '
]
const colors: Record<string, string> = {
  o: '#79626a', t: '#466466', c: '#87aca4', C: '#aec8b9',
  s: '#d79b82', l: '#f0bc9e', h: '#ffdab7'
}
const tapX = [4, 2, 1, 0, -2, -3, -3, -2, -1, 0, 2, 4]
const rubX = [0, 0, -3, -2, 0, 2, 3, 2, 0, -2, 0, 0]
const liftY = [-5, -2, 0, 1, 1, 1, 0, 0, 1, 1, -2, -5]

export function drawHeadPat(ctx: Pick<CanvasRenderingContext2D, 'fillStyle' | 'fillRect'>,
  browX: number, browY: number, kind: number, phase: number) {
  const dx = kind === 0 ? tapX[phase] : rubX[phase] * (kind === 2 ? -1 : 1)
  const left = browX + dx - 8, top = browY + liftY[phase] - 13
  hand.forEach((line, y) => {
    for (let x = 0; x < line.length;) {
      const pixel = line[x]
      let end = x + 1
      while (line[end] === pixel) end++
      if (colors[pixel]) {
        ctx.fillStyle = colors[pixel]
        ctx.fillRect(left + x, top + y, end - x, 1)
      }
      x = end
    }
  })
  if (phase < 4 || phase > 9) return
  const heartX = browX - 11 - Math.floor((phase - 4) / 3)
  const heartY = browY - 9 - (phase - 4)
  ctx.fillStyle = '#cf727d'
  ctx.fillRect(heartX, heartY, 2, 1)
  ctx.fillRect(heartX + 3, heartY, 2, 1)
  ctx.fillRect(heartX, heartY + 1, 5, 1)
  ctx.fillRect(heartX + 1, heartY + 2, 3, 1)
  ctx.fillRect(heartX + 2, heartY + 3, 1, 1)
  ctx.fillStyle = '#f9b8a7'
  ctx.fillRect(heartX + 1, heartY + 1, 1, 1)
}
