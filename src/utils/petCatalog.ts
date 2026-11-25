// The array positions are action and scene IDs on the USB wire. Append new IDs.
export const petActions = ['idle', 'walk', 'sleep', 'eat', 'fall', 'fetch', 'run', 'jump', 'daydream', 'flee', 'blink', 'trip_angry', 'gaze_owner', 'stand_watch', 'inspect_table', 'binky', 'groom_fur', 'groom_ear'] as const
export const playableActions = ['idle', 'blink', 'walk', 'run', 'jump', 'sleep', 'daydream', 'eat', 'flee', 'trip_angry', 'gaze_owner', 'stand_watch', 'inspect_table', 'binky', 'groom_fur', 'groom_ear'] as const
export const petActionLabels: Record<typeof petActions[number], string> = {
  idle: '待机', walk: '散步', sleep: '睡觉', eat: '吃东西', fall: '水果掉落', fetch: '捡水果',
  run: '奔跑', jump: '跳跃', daydream: '做白日梦', flee: '受惊逃跑', blink: '眨眼',
  trip_angry: '绊脚生气', gaze_owner: '面向主人发呆', stand_watch: '站起来眺望', inspect_table: '趴桌边看看', binky: '兔子舞', groom_fur: '舔毛', groom_ear: '抱耳梳理'
}
export const petStats = [
  { id: 'satiety', command: 23, label: '饱食度' },
  { id: 'energy', command: 24, label: '精神值' },
  { id: 'mood', command: 25, label: '心情值' },
  { id: 'affection', command: 26, label: '好感度' }
] as const

// Flash journals and all supported USB generations encode the second stat as fatigue.
export const invertPetEnergy = (value: number) => 100 - value

export function isStatCommand(command: number) {
  return Number.isInteger(command) && command >= 23 && command <= 26
}
export function isStatValue(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 100
}

export const petScenes = ['garden', 'nursery'] as const
export type PetScene = typeof petScenes[number]
export const petSceneLabels: Record<typeof petScenes[number], string> = { garden: '花园', nursery: '宝宝房' }

export const petFruitIds = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'pear', 'cherry', 'watermelon'] as const
export const petFruitLabels: Record<typeof petFruitIds[number], string> = {
  apple: '苹果', banana: '香蕉', orange: '橙子', grape: '葡萄', strawberry: '草莓', pear: '梨', cherry: '樱桃', watermelon: '西瓜'
}

export const hutchBounds = { minX: 41, maxX: 280, minY: 69, maxY: 167 } as const
export const defaultHutchPosition = { x: 246, y: 142 } as const
export const petDecorations = [
  { id: 'rabbit_hutch', itemId: 9, wireId: 1, kind: 'decoration', minGeneration: 2, scenes: ['nursery'],
    label: '兔窝', description: '走进宝宝房的兔窝，蜷起来小憩片刻。' }
] as const
export const petToys = [
  { id: 'carrot_toy', itemId: 10, wireId: 2, kind: 'toy', minGeneration: 3, scenes: petScenes,
    label: '胡萝卜玩具', description: '走近胡萝卜，用鼻尖推着玩。' }
] as const
export const petRoomItems = [...petDecorations, ...petToys] as const

export function toysForScene(scene: PetScene | null, generation: number) {
  return petRoomItems.filter(item => (item.kind === 'toy' || generation < 4) &&
    item.minGeneration <= generation && item.scenes.some(value => value === scene))
}

export const petItems = [
  ...petFruitIds.map((id, index) => ({
    id, itemId: index + 1, wireId: index + 1, minGeneration: 1, kind: 'fruit' as const,
    label: petFruitLabels[id], description: '投喂一份' + petFruitLabels[id] + '。'
  })),
  ...petRoomItems
]

// Earlier firmware exposed the hutch through the toy API. Keep that input spelling available.
export type PetToyId = typeof petRoomItems[number]['id']
export const petToyIds = petRoomItems.map(item => item.id) as [PetToyId, ...PetToyId[]]
export const petToyPhases = ['idle', 'approaching', 'using'] as const
export const petFoodStages = ['falling', 'landed', 'eating'] as const
export const petHeadGestures = ['tap', 'cw', 'ccw'] as const
// 3/4 continue a held clockwise/counterclockwise stroke without granting a second reward.
export function isHeadPetInput(value: number) {
  return Number.isInteger(value) && value >= 0 && (value <= 6 || (value >= 8 && value < 24))
}

function validFoodEntries(p: Uint8Array, start: number, end: number) {
  for (let i = start; i < end; i += 6) {
    const x = p[i + 1] | (p[i + 2] << 8)
    const rawY = p[i + 3] | (p[i + 4] << 8)
    const y = rawY >= 0x8000 ? rawY - 0x10000 : rawY
    if (!p[i] || p[i] > petFruitIds.length || x >= 320 || y < -9 || y > 129 || p[i + 5] >= petFoodStages.length) return false
  }
  return true
}

// Control state lengths include all visible foods; reject partial SPI/USB snapshots.
export function petStateGeneration(p: Uint8Array) {
  if (p.length === 12) return 1
  if (p.length === 19) return 2
  if (p.length < 33 || p[32] > 8) return 0
  const endOfFoods = 33 + 6 * p[32]
  const roomEnd = endOfFoods + 10 + 6 * p[endOfFoods + 9]
  const danceSupported = p.length === roomEnd + 3 && (p[roomEnd + 2] === 8 || p[roomEnd + 2] === 9 || p[roomEnd + 2] === 10)
  const tableSupported = danceSupported || p.length === roomEnd + 1 && p[roomEnd] === 7
  const layoutEnd = tableSupported ? roomEnd : p.length
  const tailLength = layoutEnd - endOfFoods
  if ((tailLength !== 0 && tailLength !== 4 && tailLength !== 6 && tailLength < 10) ||
      p[16] >= petScenes.length || p[17] > (tableSupported ? 3 : petRoomItems.length) || p[18] >= petToyPhases.length ||
      p.subarray(19, 27).some(id => id > petItems.length) ||
      p[28] > 59 || p[29] > petRoomItems.length || p[30] > petRoomItems.length || p[31] > 100) return 0
  if (!validFoodEntries(p, 33, endOfFoods)) return 0
  if (tailLength === 0) return 3
  const x = p[endOfFoods] | (p[endOfFoods + 1] << 8)
  const y = p[endOfFoods + 2]
  if (p[29] === 1 || p[30] === 1 || !isHutchPosition(x, y) ||
      p[endOfFoods + 3] < hutchBounds.minY || p[endOfFoods + 3] > hutchBounds.maxY) return 0
  if (tailLength === 4) return 4
  const remaining = p[endOfFoods + 4], kind = p[endOfFoods + 5]
  if (remaining > 120 || kind >= petHeadGestures.length || (!remaining && kind !== 0)) return 0
  if (tailLength >= 10) {
    const count = p[endOfFoods + 9]
    return count <= 8 && tailLength === 10 + count * 6 && p[endOfFoods + 6] < 12 &&
      p[endOfFoods + 7] < 8 && p[endOfFoods + 8] <= 100 && validFoodEntries(p, endOfFoods + 10, layoutEnd) ? (danceSupported ? p[roomEnd + 2] : tableSupported ? 7 : 6) : 0
  }
  return 5
}

export function isHutchPosition(x: number, y: number) {
  return Number.isInteger(x) && Number.isInteger(y) &&
    x >= hutchBounds.minX && x <= hutchBounds.maxX && y >= hutchBounds.minY && y <= hutchBounds.maxY
}

export const binkyDuration = 1125
export const binkyChance = (mood: number) => 4 + Math.floor(mood * mood / 250)
export function binkyMotion(age: number) {
  const t = Math.min(687, Math.max(0, age - 125))
  return { travel: Math.floor(t * 36 / 687), lift: Math.floor(96 * t * (687 - t) / (687 * 687)), facing: age >= 500 ? -1 : 1 }
}
