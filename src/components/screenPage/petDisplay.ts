import { petActionLabels, petActions, petStats } from '../../utils/petCatalog'
import type { PetOledRow } from './screenContent'

export { petStats } from '../../utils/petCatalog'

export const petParameters = [
  ...petStats,
  { id: 'action', label: '当前动作' },
  { id: 'hour', label: '场景时间' },
  { id: 'season', label: '场景季节' },
  { id: 'fruit', label: '当前水果' },
  { id: 'queue', label: '待投喂数' }
] as const

export type PetParameter = typeof petParameters[number]['id']
export const petSeasons = ['春', '夏', '秋', '冬']
export const petFruits = ['无', '苹果', '香蕉', '橙子', '葡萄', '草莓', '梨', '樱桃', '西瓜']

export interface HutchPosition { x: number; y: number }

export interface PetState {
  active: boolean
  action: number
  x: number
  rabbitY?: number
  headPatRemaining?: number
  actionAgeMs?: number
  facing?: number
  headPatPhase?: number
  headPatKind?: number
  fruit: number
  hour: number
  minute?: number
  season: number
  queue: number
  stats?: Record<typeof petStats[number]['id'], number>
  scene: number
  activeToy: number
  toyPhase: number
  hutchPosition?: HutchPosition
  deployedToys?: readonly number[]
  toyDrop?: number
  foods?: readonly { id: number; x: number; y: number; stage: number }[]
}

export function petValue(parameter: PetParameter, state: PetState) {
  switch (parameter) {
    case 'action': return petActionLabels[petActions[state.action]] ?? '—'
    case 'hour': return String(state.hour).padStart(2, '0') + ':' + String(state.minute ?? 0).padStart(2, '0')
    case 'season': return petSeasons[state.season] ?? '—'
    case 'fruit': return petFruits[state.fruit] ?? '—'
    case 'queue': return String(state.queue)
    default: return state.stats ? String(state.stats[parameter]) : '—'
  }
}

const shortLabels = { action: '动作', hour: '时间', season: '季节', fruit: '水果', queue: '队列',
  satiety: '饱食度', energy: '精神值', mood: '心情值', affection: '好感度' }

function petParameterRow(id: PetParameter, state: PetState): PetOledRow {
  const label = shortLabels[id]
  let value = petValue(id, state)
  if (id === 'action' && petActions[state.action] === 'gaze_owner') value = '看主人'
  switch (id) {
    case 'action':
    case 'season':
    case 'fruit':
      return { label, value }
    case 'hour':
      return { label, value, progress: (state.hour * 60 + (state.minute ?? 0)) / 1439 }
    case 'queue':
      return { label, value, progress: state.queue / 8 }
    default:
      return { label, value, progress: state.stats ? state.stats[id] / 100 : null }
  }
}

export function petParameterContent(ids: readonly [PetParameter, PetParameter], state: PetState) {
  return { mode: 'pet', rows: [petParameterRow(ids[0], state), petParameterRow(ids[1], state)] } as const
}
