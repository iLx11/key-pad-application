import { createHash, timingSafeEqual } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { createServer } from 'node:http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import SerialConnect from './serialPort'
import { petCareGuide, petServerInstructions } from './petCareGuide'
import type { PetRequest } from './screenReadback'
import { invertPetEnergy, petActions, playableActions, petScenes, petRoomItems, petToyIds, petToyPhases, petFruitIds as fruits,
  petItems, toysForScene, petStateGeneration, petFoodStages, petHeadGestures, petDecorations, hutchBounds } from '../../src/utils/petCatalog'

const seasons = ['spring', 'summer', 'autumn', 'winter'] as const
const sources = ['automatic', 'physical', 'mcp'] as const
const commands = { state: 0, mode: 1, feed: 2, action: 3, hour: 4, season: 5, scene: 6, toy: 7,
  interactToy: 11, placeToy: 13, moveHutch: 14, visitHutch: 15 }
// Older MCP clients used toy_factory for the room at USB scene index 1.
const sceneInput = z.preprocess(value => value === 'toy_factory' ? 'nursery' : value, z.enum(petScenes))
const toyForWireId = (id: number) => petRoomItems.find(item => item.wireId === id)?.id ?? null
const decoration = z.literal('rabbit_hutch')

function deviceError(code: string, message: string) {
  return Object.assign(Error(message), { code })
}

async function requestDevice(request: PetRequest, session?: string) {
  const reply = await SerialConnect.pet(request, session)
  if (reply.state !== 'ready') {
    const errors = {
      busy: '键盘正在传输数据，请稍后重试。',
      unsupported: '当前固件不支持这项桌宠功能，请升级键盘固件。',
      disconnected: 'MultiPad 未连接。',
      unavailable: '没有收到设备回复。修改操作可能已经生效，请先查询状态或事件。'
    }
    throw deviceError(reply.state, errors[reply.state])
  }
  if (reply.status !== 0) {
    if (reply.status === 4) {
      const blocked = '先读 pet_get_state.availableNow，等可执行后再决定。'
      if ('command' in request && request.command === commands.feed) throw deviceError('pet_busy', '键盘当前无法接收更多水果。' + blocked)
      if ('command' in request && request.command === commands.placeToy) throw deviceError('slot_occupied', '当前场景已有其他玩具。' + blocked)
      throw deviceError('pet_busy', '兔子当前状态无法执行此操作。' + blocked)
    }
    if (reply.status === 5) throw deviceError('inactive', '键盘处于工作模式。主人选择养宠模式后可再操作。')
    if ('command' in request && request.command === commands.hour) throw deviceError('time_rejected', '键盘拒绝修改时间，请读取 followRealTime 和 availableNow.setHour。')
    if ('command' in request && [commands.toy, commands.placeToy, commands.interactToy].includes(request.command)) {
      throw deviceError('toy_unavailable', '查看 pet_get_state.availableNow 和 deployedToys。第 4 代的兔窝通过 pet_interact_with_decoration 使用。')
    }
    throw deviceError('device_rejected', '键盘拒绝了此桌宠命令，请读取 generation 和 availableNow，确认固件支持所选功能。')
  }
  return reply
}

function decodeState(payload: Buffer, session?: string) {
  const generation = petStateGeneration(payload)
  if (!generation) throw Error('桌宠状态格式不匹配。')
  const extended = generation >= 2
  const scene = extended ? petScenes[payload[16]] ?? null : null
  const visitingTable = generation >= 7 && payload[17] === 3
  const visitingHutch = generation >= 4 && payload[17] === 1
  const endOfFoods = generation >= 3 ? 33 + 6 * payload[32] : 0
  const phase = extended ? petToyPhases[payload[18]] : null
  const readFoods = (offset: number) => Array.from({ length: payload[offset] }, (_, index) => {
    const i = offset + 1 + index * 6
    return { fruit: fruits[payload[i] - 1], x: payload.readUInt16LE(i + 1),
      y: payload.readInt16LE(i + 3), stage: petFoodStages[payload[i + 5]] }
  })
  const other = scene === 'garden' ? 'nursery' : 'garden'
  const flags = payload[endOfFoods + 7]
  return {
    session,
    generation,
    active: Boolean(payload[0]),
    action: payload[0] ? petActions[payload[1]] ?? null : null,
    positionX: payload[0] ? payload.readUInt16LE(2) : null,
    positionY: generation >= 4 && payload[0] ? payload[endOfFoods + 3] : null,
    frames: payload.readUInt32LE(4),
    fruit: fruits[payload[8] - 1] ?? null,
    hour: payload[9],
    minute: generation >= 3 ? payload[28] : null,
    season: seasons[payload[10]],
    queuedFruit: payload[11],
    stats: extended ? { satiety: payload[12], energy: invertPetEnergy(payload[13]), mood: payload[14], affection: payload[15] } : null,
    scene,
    activeToy: extended && !visitingHutch && !visitingTable ? toyForWireId(payload[17]) : null,
    toyPhase: visitingHutch || visitingTable ? 'idle' : phase,
    activeDecoration: visitingTable ? 'nursery_table' : visitingHutch ? 'rabbit_hutch' : null,
    decorationPhase: generation >= 4 ? (visitingTable || visitingHutch ? phase : 'idle') : null,
    hutchPosition: generation >= 4 ? { x: payload.readUInt16LE(endOfFoods), y: payload[endOfFoods + 2] } : null,
    actionAgeMs: generation >= 8 ? payload.readUInt16LE(payload.length - 3) : null,
    facing: generation >= 6 ? (flags & 1 ? 'right' : 'left') : null,
    otherRoom: generation >= 6 ? { scene: other, foods: readFoods(endOfFoods + 9), toyDropProgress: payload[endOfFoods + 8] } : null,
    awaitingPlay: generation >= 6 ? { garden: Boolean(flags & 2), nursery: Boolean(flags & 4) } : null,
    headPet: generation >= 5 ? { remainingMs: payload[endOfFoods + 4] * 10,
      ...(generation >= 6 ? { phase: payload[endOfFoods + 6] } : {}),
      gesture: payload[endOfFoods + 4] ? petHeadGestures[payload[endOfFoods + 5]] : null } : null,
    availableToys: toysForScene(scene, generation).map(toy => toy.id),
    keyBindings: generation >= 3 ? Array.from(payload.subarray(19, 27), slot =>
      petItems.find(item => item.itemId === slot)?.id ?? null) : null,
    followRealTime: generation >= 3 ? Boolean(payload[27] & 1) : null,
    bedtime: generation >= 3 ? Boolean(payload[27] & 2) : null,
    deployedToys: generation >= 3 ? { garden: toyForWireId(payload[29]), nursery: toyForWireId(payload[30]) } : null,
    toyDropProgress: generation >= 3 ? payload[31] : null,
    foods: generation >= 3 ? readFoods(32) : null
  }
}

type State = ReturnType<typeof decodeState>

function leavesFoodOnGround(state: State) {
  return (state.stats?.satiety ?? 0) >= (state.generation >= 6 ? 90 : 100)
}

function careNote(state: State) {
  if (!state.active) return '键盘在工作模式，等待主人进入养宠模式。'
  if (state.fruit) return '兔子正在取食 ' + state.fruit + '。可等 fruit_eaten 再决定下一步。'
  if (state.bedtime) return state.action === 'sleep'
    ? '兔子正在窝里长睡。可以继续休息，或用 idle 叫醒。'
    : '兔子正在走回窝里睡觉。等到 using，再看精神值。'
  if (state.activeToy || state.activeDecoration) return '兔子正在靠近或使用道具。等 finished 事件，就能判断互动是否自然结束。'
  if (state.generation >= 3 && leavesFoodOnGround(state)) return '兔子吃饱了。已经落地的食物会留到下次饿时再吃。'
  if (state.foods?.length || state.queuedFruit) return '已有水果，接下来会落地或取食。'
  if (state.toyDropProgress !== null && state.toyDropProgress < 100) return '玩具正在落下，等到进度 100 后兔子可以靠近。'
  return '可以选一个动作，也可以让兔子继续当前活动。'
}

function availableNow(state: State) {
  const { generation, active, scene, availableToys, fruit } = state
  const floor = generation >= 3
  const occupied = Boolean(state.activeToy || state.activeDecoration)
  const legacyBusy = !floor && Boolean(fruit || state.queuedFruit || occupied)
  const full = state.stats?.satiety === 100
  const foodSlots = 8 - (state.foods?.length ?? state.queuedFruit)
  const deployed = scene && state.deployedToys?.[scene]
  const actions = playableActions.filter(action => {
    if (!active || fruit || legacyBusy) return false
    if ((action === 'groom_fur' || action === 'groom_ear') && generation < 9) return false
    if (action === 'binky' && generation < 8) return false
    if ((action === 'stand_watch' || action === 'inspect_table') && generation < 7) return false
    if (action === 'inspect_table' && (scene !== 'nursery' || occupied)) return false
    if (generation === 1 && petActions.indexOf(action) > petActions.indexOf('blink')) return false
    if (floor && action === 'eat' && full) return false
    return !occupied || state.bedtime || action === 'sleep'
  })
  return {
    actions,
    feed: active && foodSlots > 0 && !(generation === 2 && occupied),
    foodSlots: active ? foodSlots : 0,
    useToys: active && !legacyBusy ? availableToys : [],
    placeToys: active && floor ? availableToys.filter(toy => !deployed || toy === deployed) : [],
    interactToys: active && deployed && !occupied && state.toyDropProgress === 100 && (!state.foods?.length || leavesFoodOnGround(state))
      ? [deployed] : [],
    visitDecorations: active && generation >= 4 && !fruit ? ['rabbit_hutch', ...(actions.includes('inspect_table') ? ['nursery_table'] : [])] : [],
    moveDecorations: active && generation >= 4 ? ['rabbit_hutch'] : [],
    scenes: active && generation >= 2 ? petScenes.filter(id => !legacyBusy || id === scene) : [],
    setHour: active && !state.followRealTime, setSeason: active, setMode: true,
    careNote: careNote(state)
  }
}

async function command(command: number, value = 0, expectedSession?: string) {
  const { payload, session } = await requestDevice({ command, value }, expectedSession)
  const state = decodeState(payload, session)
  return { ...state, availableNow: availableNow(state) }
}

function decodeEvent(payload: Buffer, offset: number) {
  const value = payload[offset + 9]
  const detail = payload[offset + 11]
  const base = {
    sequence: payload.readUInt32LE(offset),
    uptimeMs: payload.readUInt32LE(offset + 4),
    source: sources[payload[offset + 10]]
  }
  switch (payload[offset + 8]) {
    case 1: return { ...base, type: 'mode_changed', active: Boolean(value) }
    case 2: return { ...base, type: 'action_changed', action: petActions[value], fruit: fruits[detail - 1] ?? null }
    case 3: return { ...base, type: 'fruit_queued', fruit: fruits[value - 1], queueDepth: detail }
    case 4: return { ...base, type: 'fruit_landed', fruit: fruits[value - 1] }
    case 5: return { ...base, type: 'fruit_eaten', fruit: fruits[value - 1] }
    case 6: return { ...base, type: 'hour_changed', hour: value, previousHour: detail }
    case 7: return { ...base, type: 'season_changed', season: seasons[value], previousSeason: seasons[detail] }
    case 8: {
      const entry = petItems.find(item => item.itemId === detail)
      // Zero was also a placeholder on legacy boards. Only label a reported, known binding.
      const binding = entry?.kind === 'fruit' ? { item: entry.id, fruit: entry.id } :
        entry?.kind === 'toy' ? { item: entry.id, toy: entry.id } : entry ? { item: entry.id } : {}
      return { ...base, type: 'key_pressed', key: value, ...binding }
    }
    case 9: return { ...base, type: 'snack', encoder: detail }
    case 10: return { ...base, type: 'scene_changed', scene: petScenes[value], previousScene: petScenes[detail] }
    case 11: return { ...base, type: 'toy_started', toy: toyForWireId(value) }
    case 12: return { ...base, type: 'toy_finished', toy: toyForWireId(value), interrupted: Boolean(detail) }
    case 13: return { ...base, type: 'toy_placed', toy: toyForWireId(value), scene: petScenes[detail] }
    case 14: return { ...base, type: 'toy_removed', toy: toyForWireId(value), scene: petScenes[detail] }
    case 15: return { ...base, type: 'decoration_started', decoration: value === 3 ? 'nursery_table' : toyForWireId(value) }
    case 16: return { ...base, type: 'decoration_finished', decoration: value === 3 ? 'nursery_table' : toyForWireId(value), interrupted: Boolean(detail) }
    case 17: return { ...base, type: 'decoration_moved', decoration: value === 3 ? 'nursery_table' : toyForWireId(value), scene: petScenes[detail] }
    case 18: return { ...base, type: 'head_petted', gesture: petHeadGestures[value], encoder: detail }
    default: return { ...base, type: 'unknown', value, detail }
  }
}

export async function readPetEvents(cursor?: string) {
  const [oldSession, offset] = cursor?.split(':') ?? []
  const after = offset ? Number(offset) : 0
  const { payload, session, reset } = await requestDevice({ after }, oldSession)
  if (!payload.length || (payload.length - 1) % 12 !== 0 || !session) throw Error('桌宠事件格式不匹配。')
  const events = []
  for (let i = 1; i < payload.length; i += 12) events.push(decodeEvent(payload, i))
  const overrun = Boolean(payload[0] & 1)
  const next = events.at(-1)?.sequence ?? (reset || overrun ? 0 : after)
  return { cursor: session + ':' + next, reset: Boolean(reset), overrun, hasMore: Boolean(payload[0] & 2), events }
}

async function result(run: () => Promise<Record<string, unknown>>) {
  try {
    const data = await run()
    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const code = error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : 'invalid_response'
    return { isError: true, content: [{ type: 'text' as const, text: message }], structuredContent: { error: { code, message } } }
  }
}

const behaviors = [...playableActions, ...fruits, ...petScenes, 'place_carrot', 'play_carrot', 'visit_hutch'] as const
const rabbitStep = z.object({
  behavior: z.enum(playableActions),
  waitMs: z.number().int().min(0).max(8000).default(0).describe('执行此步之前等待的毫秒数')
}).strict()
export const rabbitSteps = z.array(rabbitStep).min(1).max(6)
const planSteps = z.array(rabbitStep.extend({ behavior: z.enum(behaviors) })).min(1).max(6)

function automaticBehaviors(s: Awaited<ReturnType<typeof command>>, rabbitOnly = false) {
  if (!s.active || s.headPet?.remainingMs || s.fruit || s.foods?.some(f => f.stage === 'eating')) return []
  const a = s.availableNow, stats = s.stats
  if ((s.activeDecoration || s.activeToy) && !(s.bedtime && s.action === 'sleep')) return []
  const canEat = !!stats && stats.satiety < 90
  const canSleep = !!stats && stats.energy <= 75
  const canPlay = !!stats && stats.mood < 90 && stats.energy > 15
  if (canEat && (s.foods?.length || s.queuedFruit)) return []
  if (rabbitOnly) {
    if (s.action === 'sleep') return stats && stats.energy >= 95 && a.actions.includes('idle') ? ['idle'] : []
    const toyPending = s.scene && (s.awaitingPlay?.[s.scene] || (s.deployedToys?.[s.scene] && s.toyDropProgress !== null && s.toyDropProgress < 100))
    if (s.bedtime || toyPending || (s.action !== 'idle' && s.action !== 'walk')) return []
  }
  return (rabbitOnly ? playableActions : behaviors).filter(b => {
    if (s.bedtime && s.action === 'sleep') return b === 'idle' && (stats?.energy ?? 0) >= 95
    if (fruits.some(f => f === b)) return canEat && a.feed && !s.foods?.length && !s.queuedFruit
    if (b === 'place_carrot') return canPlay && a.placeToys.includes('carrot_toy') && s.scene && !s.deployedToys?.[s.scene]
    if (b === 'play_carrot') return canPlay && a.interactToys.includes('carrot_toy')
    if (b === 'visit_hutch') return canSleep && a.visitDecorations.length > 0
    if (b === 'garden' || b === 'nursery') return s.scene !== b && a.scenes.includes(b)
    if (rabbitOnly) {
      if (stats && stats.energy <= 25) return b === 'sleep' && a.actions.includes(b)
      if (b === 'idle' || b === 'eat' || b === 'flee' || b === 'trip_angry' || b === s.action) return false
      if (b === 'sleep' && (!stats || stats.energy > 45)) return false
      if ((b === 'run' || b === 'jump' || b === 'binky') && (!stats || stats.energy < 45 || stats.satiety < 35)) return false
      if (b === 'binky' && (stats?.mood ?? 0) < 60) return false
    }
    if (stats && stats.energy <= 15 && (b === 'run' || b === 'jump' || b === 'binky' || b === 'flee')) return false
    if (b === 'eat' && !canEat || b === 'sleep' && !canSleep || b === 'gaze_owner' && (stats?.affection ?? 100) >= 90) return false
    return a.actions.some(action => action === b)
  })
}

function behaviorCommand(b: typeof behaviors[number]): [number, number] {
  const fruit = fruits.findIndex(f => f === b)
  if (fruit >= 0) return [commands.feed, fruit + 1]
  if (b === 'place_carrot' || b === 'play_carrot') return [b === 'place_carrot' ? commands.placeToy : commands.interactToy, 2]
  if (b === 'visit_hutch') return [commands.visitHutch, 0]
  if (b === 'garden' || b === 'nursery') return [commands.scene, petScenes.indexOf(b)]
  return [commands.action, petActions.findIndex(action => action === b)]
}

let planRunning = false
export function createPetMcp(enabled: () => boolean = () => true,
  onStepAccepted?: (behavior: typeof behaviors[number], index: number, total: number) => void, scope: 'keyboard' | 'rabbit' = 'keyboard') {
  const rabbitOnly = scope === 'rabbit'
  const server = new McpServer({ name: 'multipad-pet', version: '1.4.0' }, { instructions: rabbitOnly ? '读取键盘状态和事件，只编排兔子自身的动作。' : petServerInstructions })
  server.registerTool('pet_perform_sequence', {
    description: rabbitOnly ? '编排 1–6 步兔子自身动作。每步先等待 waitMs 毫秒，再按键盘实况确认能否执行。' : '按顺序安排 1–6 步身体动作、投喂（水果名）、场景、玩具或回窝。waitMs 是每步发出前的等待。每步读取真机，需求已满足、被摸头、设备忙或会话改变即停止。accepted 是已接收的步骤，实际完成看事件。',
    inputSchema: { steps: rabbitOnly ? rabbitSteps : planSteps, session: z.string().optional().describe('使用这次观察到的设备会话') }
  }, ({steps, session}, extra) => result(async () => {
    if (planRunning) throw Error('上一段动作尚未结束')
    planRunning = true
    const accepted: string[] = []
    try {
      let state: Awaited<ReturnType<typeof command>> | undefined
      const expected = session ?? (await command(commands.state)).session
      for (const step of steps) {
        if (step.waitMs) await delay(step.waitMs, undefined, { signal: extra.signal })
        if (!enabled() || extra.signal.aborted) return { accepted, stoppedBefore: step.behavior }
        state = await command(commands.state)
        if (!enabled() || extra.signal.aborted || state.session !== expected || !automaticBehaviors(state, rabbitOnly).includes(step.behavior))
          return { accepted, stoppedBefore: step.behavior, state }
        const [opcode, value] = behaviorCommand(step.behavior)
        try {
          state = await command(opcode, value, expected)
        } catch (error) {
          return { accepted, stoppedBefore: step.behavior, reason: error instanceof Error ? error.message : '设备未确认此步' }
        }
        accepted.push(step.behavior)
        onStepAccepted?.(step.behavior, accepted.length, steps.length)
      }
      return { accepted, state }
    } finally { planRunning = false }
  }))
  server.registerTool('pet_get_state', {
    description: '读取键盘实况。availableNow 给出此刻可选的动作、道具和操作，generation 表示固件能力。' +
      '结合动作、属性、食物阶段、玩具和装饰互动进度决定行动或等待。旧固件缺少的扩展字段为 null。',
    annotations: { readOnlyHint: true }
  }, () => result(async () => {
    const state = await command(commands.state)
    const availableNow = rabbitOnly ? { actions: state.availableNow.actions, careNote: state.availableNow.careNote } : state.availableNow
    return { ...state, availableNow, automaticBehaviors: automaticBehaviors(state, rabbitOnly),
      ...(rabbitOnly ? { reactionBehaviors: automaticBehaviors({ ...state, headPet: null }, true) } : {}) }
  }))

  server.registerTool('pet_get_events', {
    description: '读取已发生的桌宠事件。后续调用传入上次响应的 cursor。包括实体投喂键、旋钮改动和自动动作。',
    inputSchema: {
      cursor: z.string().regex(/^[0-9a-f-]{36}:\d{1,10}$/i)
        .refine(value => Number(value.split(':')[1]) <= 0xffffffff).optional()
    },
    annotations: { readOnlyHint: true }
  }, ({ cursor }) => result(() => readPetEvents(cursor)))
  if (rabbitOnly) return server

  server.registerTool('pet_get_care_guide', {
    description: '查阅固件照料手册，包括属性方向、各种动作的时长和效果、投喂、玩具、兔窝、场景和事件。无需连接键盘。',
    annotations: { readOnlyHint: true }
  }, () => result(async () => petCareGuide))
  server.registerTool('pet_set_mode', {
    description: '进入桌宠模式，或者退出并恢复当前层的彩屏画面。',
    inputSchema: { enabled: z.boolean() }
  }, ({ enabled }) => result(() => command(commands.mode, Number(enabled))))

  server.registerTool('pet_play_action', {
    description: '播放指定动作。sleep 会去宝宝房的兔窝睡觉；在途时 action 仍为 walk，bedtime 为 true。idle 可叫醒兔子，投喂水果请用 pet_feed。',
    inputSchema: { action: z.enum(playableActions) }
  }, ({ action }) => result(() => command(commands.action, petActions.indexOf(action))))

  server.registerTool('pet_feed', {
    description: '投下一份水果。最多同时保留八份。兔子饱了会把水果留在地上，只有 fruit_eaten 事件表示吃完。',
    inputSchema: { fruit: z.enum(fruits) }
  }, ({ fruit }) => result(() => command(commands.feed, fruits.indexOf(fruit) + 1)))

  server.registerTool('pet_set_time', {
    description: '手动设置场景的整点时间，0–23。先在设置里关闭跟随现实时间。',
    inputSchema: { hour: z.number().int().min(0).max(23) }
  }, ({ hour }) => result(() => command(commands.hour, hour)))

  server.registerTool('pet_set_season', {
    description: '设置春、夏、秋或冬，切换当前场景的季节配色。',
    inputSchema: { season: z.enum(seasons) }
  }, ({ season }) => result(() => command(commands.season, seasons.indexOf(season))))

  server.registerTool('pet_set_scene', {
    description: '切换彩屏背景。garden 是花园，nursery 是有玩具和兔窝的宝宝房。',
    inputSchema: { scene: sceneInput }
  }, ({ scene }) => result(() => command(commands.scene, petScenes.indexOf(scene))))

  server.registerTool('pet_list_toys', {
    description: '列出当前场景的互动玩具。传 scene 可查询指定场景的玩具目录。',
    inputSchema: { scene: sceneInput.optional() },
    annotations: { readOnlyHint: true }
  }, ({ scene }) => result(async () => {
    // An explicit scene also supports browsing the app's catalogue without a keyboard.
    const pet = await command(commands.state).catch((error: unknown) => {
      if (scene && error instanceof Error && 'code' in error && error.code === 'disconnected') return null
      throw error
    })
    const selected = scene ?? pet?.scene ?? null
    const generation = pet?.generation ?? 4
    const toys = toysForScene(selected, generation).map(({ id, label, description }) => ({ id, label, description }))
    return { scene: selected, toys }
  }))

  server.registerTool('pet_use_toy', {
    description: '切换当前场景中的玩具。首次放下后兔子会去玩；再次选择同一玩具会收回，选择其他玩具会替换。旧版固件执行一次短暂互动。',
    inputSchema: { toy: z.enum(petToyIds) }
  }, ({ toy }) => result(async () => {
    // Existing clients used this call for a hutch rest before it became permanent scenery.
    if (toy === 'rabbit_hutch' && (await command(commands.state)).generation >= 4) return command(commands.visitHutch)
    return command(commands.toy, petRoomItems.find(entry => entry.id === toy)!.wireId)
  }))

  server.registerTool('pet_place_toy', {
    description: '在当前场景的空位放下玩具。相同玩具已放置时保持原状；若已有其他玩具，返回忙。',
    inputSchema: { toy: z.enum(petToyIds) }
  }, ({ toy }) => result(() => command(commands.placeToy, petRoomItems.find(entry => entry.id === toy)!.wireId)))

  server.registerTool('pet_interact_with_toy', {
    description: '让兔子和当前场景中已落地的玩具再玩一次，保留玩具的位置。',
    inputSchema: { toy: z.enum(petToyIds) }
  }, ({ toy }) => result(() => command(commands.interactToy, petRoomItems.find(entry => entry.id === toy)!.wireId)))

  server.registerTool('pet_list_decorations', {
    description: '查询场景中常驻的互动装饰，包括当前位置和可移动范围。省略 scene 时查询当前场景。',
    inputSchema: { scene: sceneInput.optional() },
    annotations: { readOnlyHint: true }
  }, ({ scene }) => result(async () => {
    const state = await command(commands.state)
    const selected = scene ?? state.scene
    const entries = selected === 'nursery' && state.hutchPosition ? petDecorations.map(({ id, label, description }) =>
      ({ id, label, description, position: state.hutchPosition, bounds: hutchBounds })) : []
    const table = selected === 'nursery' && state.generation >= 7
      ? [{ id: 'nursery_table', label: '玩具桌', description: '走到木桌右侧，搭着桌沿看桌上的玩具。', movable: false, position: { x: 82, y: 93 } }] : []
    return { scene: selected, decorations: [...entries, ...table] }
  }))

  server.registerTool('pet_move_decoration', {
    description: '移动宝宝房的兔窝。坐标是 320×172 画面中兔窝底边中心的位置，键盘保存设置。',
    inputSchema: { decoration, x: z.number().int().min(hutchBounds.minX).max(hutchBounds.maxX),
      y: z.number().int().min(hutchBounds.minY).max(hutchBounds.maxY) }
  }, ({ x, y }) => result(() => command(commands.moveHutch, x | (y << 9))))

  server.registerTool('pet_interact_with_decoration', {
    description: '访问兔窝小憩，或在宝宝房走到玩具桌边，站起来搭住桌沿观察。',
    inputSchema: { decoration: z.enum(['rabbit_hutch', 'nursery_table']) }
  }, ({ decoration }) => result(() => decoration === 'nursery_table'
    ? command(commands.action, petActions.indexOf('inspect_table')) : command(commands.visitHutch)))

  return server
}

export function startPetMcp() {
  const token = process.env.MULTIPAD_PET_MCP_TOKEN
  if (!token) return
  if (!/^[\x21-\x7e]{16,128}$/.test(token)) throw Error('MULTIPAD_PET_MCP_TOKEN 需要 16–128 个非空格 ASCII 字符')
  const port = Number(process.env.MULTIPAD_PET_MCP_PORT ?? 18775)
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('无效的 MULTIPAD_PET_MCP_PORT')
  const host = '127.0.0.1'
  const authority = host + ':' + port
  const expected = createHash('sha256').update('Bearer ' + token).digest()
  const http = createServer(async (request, response) => {
    if (request.url !== '/mcp') {
      response.writeHead(404).end()
      return
    }
    if (request.headers.host !== authority || request.headers.origin !== undefined) {
      response.writeHead(403).end()
      return
    }
    const supplied = createHash('sha256').update(request.headers.authorization ?? '').digest()
    if (!timingSafeEqual(expected, supplied)) {
      response.writeHead(401, { 'WWW-Authenticate': 'Bearer' }).end()
      return
    }
    if (request.method !== 'POST') {
      response.writeHead(405, { Allow: 'POST' }).end()
      return
    }

    const server = createPetMcp()
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
      maxRequestBodySize: 8192
    })
    response.once('close', () => { void server.close().catch(() => {}) })
    try {
      await server.connect(transport)
      await transport.handleRequest(request, response)
    } catch (error) {
      console.error('MultiPad MCP request failed', error)
      if (!response.headersSent) response.writeHead(500)
      response.end()
    }
  })
  http.on('error', error => console.error('MultiPad MCP could not listen', error))
  http.listen(port, host)
  return http
}
