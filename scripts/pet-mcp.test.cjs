const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const { compileFunction } = require('node:vm')
const ts = require('typescript')
const { Client } = require('@modelcontextprotocol/sdk/client/index.js')
const { InMemoryTransport } = require('@modelcontextprotocol/sdk/inMemory.js')

// Exercise the real SDK, tool registration and model adapter. Replace the keyboard,
// credential store, timer and model endpoint without opening COM or making network requests.
function loadModule(relative, dependencies = {}, globals = {}) {
  const file = resolve(__dirname, relative)
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText
  const exports = {}
  const load = name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name)
  compileFunction(code, ['require', 'exports', ...Object.keys(globals)], { filename: file })(load, exports, ...Object.values(globals))
  return exports
}

const session = 'cccccccc-0000-0000-0000-000000000000'
const pathToCatalog = '../../src/utils/petCatalog'
const catalog = loadModule('../src/utils/petCatalog.ts')
const guide = loadModule('../electron/controller/petCareGuide.ts', { [pathToCatalog]: catalog })
function payload(generation = 4, fields = {}, foodIds = [], headPet = [0, 0]) {
  const endOfFoods = 33 + foodIds.length * 6
  const p = Buffer.alloc(endOfFoods + 10 + (generation >= 8 ? 3 : Number(generation === 7)))
  p.set([1,0,78,0,0,0,0,0,0,12,1,0,65,24,68,45,1,0,0])
  p[31] = 100
  p[32] = foodIds.length
  foodIds.forEach((id, i) => p.set([id,41+i*34,0,129,0,1],33+i*6))
  p.set([246,0,142,139,...headPet], endOfFoods)
  if (generation >= 7) p[p.length - 1] = generation
  for (const [i,v] of Object.entries(fields)) p[Number(i)] = v
  return p.subarray(0, [0, 12, 19, endOfFoods, endOfFoods + 4, endOfFoods + 6, endOfFoods + 10, endOfFoods + 11, p.length, p.length, p.length][generation])
}
function eventPage(events, after = 0) {
  const p = Buffer.alloc(1 + events.length * 12)
  for (const [i, [kind,value,source,detail]] of events.entries()) {
    const offset = 1 + 12*i
    p.writeUInt32LE(after+i+1, offset)
    p.writeUInt32LE((i+1)*40, offset+4)
    p.set([kind,value,source,detail],offset+8)
  }
  return p
}

test('serial protocol probes with reads, and transmits each supported owner gesture exactly once', async () => {
  const { default: ScreenReadback } = loadModule('../electron/controller/screenReadback.ts', {
    [pathToCatalog]: catalog, '../../src/utils/deviceScreenFormat': { DEVICE_SCREEN_SIZES: [] }
  })
  for (const generation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const writes = []
    const reader = new ScreenReadback(async request => {
      const requested = request.readUInt32LE(6), offset = request.readUInt32LE(11)
      writes.push({ requested, offset })
      const effective = requested >= 2 && requested <= generation ? requested : 1
      const data = payload(effective)
      const frame = Buffer.alloc(21 + data.length)
      frame.set([0x4d,0x50,0x53,1])
      request.copy(frame, 4, 4, 6)
      frame[7] = request[10]
      frame.writeUInt32LE(offset, 12)
      frame.writeUInt16LE(data.length, 16)
      frame.set(data, 19)
      let crc = 0xffff
      for (const byte of frame.subarray(0, -2)) {
        crc ^= byte << 8
        for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0)) & 65535
      }
      frame.writeUInt16LE(crc, frame.length - 2)
      setImmediate(() => reader.accept(frame))
      return true
    })
    try {
      for (const input of [0,1,2,3,4]) {
        const reply = await reader.readPet({ command: 22, value: input })
        assert.equal(reply.state, generation >= 5 ? 'ready' : 'unsupported')
      }
      assert.deepEqual(writes.filter(p=>!p.offset).map(p=>p.requested), [10,9,8,7,6,5,4,3,2].filter(g=>g>=generation))
      const mutations = writes.filter(p=>p.offset).map(p=>p.offset)
      assert.deepEqual(mutations, generation >= 5 ? [0,1,2,3,4].map(v=>22|(v<<8)) : [])
      for (const value of [16, 17])
        assert.equal((await reader.readPet({command:3,value})).state, generation >= 9 ? 'ready' : 'unsupported')
      for (const cmd of [23, 24, 25, 26])
        assert.equal((await reader.readPet({command:cmd, value:75})).state, generation === 10 ? 'ready' : 'unsupported')
      if (generation === 10) assert.equal((await reader.readPet({command:23,value:101})).state, 'unavailable')
      if (generation === 5) assert.equal((await reader.readPet({command:22,value:5})).state, 'unsupported')
    } finally {
      reader.close()
    }
  }
  for (const invalid of [[121,0],[1,3],[0,2]]) assert.equal(catalog.petStateGeneration(payload(5,{},[1],invalid)),0)
})

function fixture(t) {
  const board = { payload: payload(), requests: [], events: [], status: 0 }
  const serial = { pet: async request => {
    board.requests.push(request)
    if (request.command) board.onWrite?.(request)
    const bytes = 'after' in request ? eventPage(board.events.slice(request.after,request.after+16),request.after) : board.payload
    if ('after' in request && board.events.length > request.after + 16) bytes[0] |= 2
    return { state: 'ready', session, status: board.status, payload: bytes }
  } }
  const mcp = loadModule('../electron/controller/petMcp.ts', {
    './serialPort': serial, [pathToCatalog]: catalog, './petCareGuide': guide
  })
  const server = mcp.createPetMcp(), client = new Client({name:'test',version:'1'})
  const [c,s] = InMemoryTransport.createLinkedPair()
  t.after(() => Promise.all([client.close(), server.close()]))
  return { board, mcp, client, async start() { await server.connect(s); await client.connect(c) },
    async call(name,args={}) { const r = await client.callTool({name,arguments:args});assert(!r.isError,JSON.stringify(r.content));return r.structuredContent } }
}

test('an MCP client discovers the offline care guide and generation-specific actions', async t => {
  const f = fixture(t)
  await f.start()
  assert.match(f.client.getInstructions(), /pet_get_care_guide/)
  assert.match(f.client.getInstructions(), /pet_get_events/)
  const tool = (await f.client.listTools()).tools.find(x => x.name === 'pet_get_care_guide')
  assert(tool.annotations.readOnlyHint)
  const rules = await f.call(tool.name)
  assert.match(rules.actions.eat, /饱食度/)
  assert.equal(Object.keys(rules.food.fruits).length, 8)
  assert.deepEqual(f.board.requests, [])
  for (const generation of [1,2,3,4,5]) {
    f.board.payload = payload(generation)
    const state = await f.call('pet_get_state'), a = state.availableNow
    assert.equal(state.generation, generation)
    assert.deepEqual(state.headPet, generation === 6 ? { remainingMs: 0, gesture: null, phase: 0 } : generation >= 5 ? { remainingMs: 0, gesture: null } : null)
    assert.equal(a.actions.includes('gaze_owner'), generation >= 2)
    assert(!a.actions.includes('fetch'));assert(!a.actions.includes('fall'))
    assert.equal(a.placeToys.includes('carrot_toy'), generation >= 3)
    assert.equal(a.useToys.includes('rabbit_hutch'), generation === 2 || generation === 3)
    assert.equal(a.visitDecorations.includes('rabbit_hutch'), generation >= 4)
  }
  f.board.payload = payload(2, {17:1,18:2})
  const old = (await f.call('pet_get_state')).availableNow
  assert.equal(old.feed,false);assert.deepEqual(old.actions,[]);assert.deepEqual(old.scenes,['nursery'])
})

test('live availability follows floor capacity, satiety, rest, toy drop and work mode', async t => {
  const f=fixture(t);await f.start()
  const available=async(fields,ids=[])=>{
    f.board.payload=payload(4,fields,ids)
    return (await f.call('pet_get_state')).availableNow
  }
  let a=await available({12:100,27:1,30:2},[1])
  assert(a.feed);assert.equal(a.foodSlots,7);assert(!a.actions.includes('eat'))
  assert(!a.setHour);assert.deepEqual(a.interactToys,['carrot_toy'])
  a=await available({30:2,31:25})
  assert.deepEqual(a.interactToys,[]);assert.deepEqual(a.placeToys,['carrot_toy'])
  a=await available({8:1},[1,2,3,4,5,6,7,8])
  assert(!a.feed);assert.deepEqual(a.actions,[]);assert.deepEqual(a.visitDecorations,[])
  a=await available({17:1,18:2,1:2})
  assert.deepEqual(a.actions,['sleep']);assert.deepEqual(a.interactToys,[])
  a=await available({17:1,18:2,1:2,27:2})
  assert(a.actions.includes('idle'));assert.match(a.careNote,/长睡/)
  a=await available({0:0})
  assert(!a.feed);assert.deepEqual(a.actions,[]);assert.deepEqual(a.moveDecorations,[]);assert(!a.setHour)
  assert(a.setMode)
  f.board.status=5
  const failed=await f.client.callTool({name:'pet_feed',arguments:{fruit:'apple'}})
  assert(failed.isError);assert.equal(failed.structuredContent.error.code,'inactive')
})

test('sixth-generation state reports both rooms without switching rooms', async t => {
  const f = fixture(t)
  await f.start()
  const current = payload(6, { 16: 1 }, [1])
  const tail = 39
  current[tail + 7] = 3
  current[tail + 8] = 72
  current[tail + 9] = 1
  f.board.payload = Buffer.concat([current, Buffer.from([2, 180, 0, 129, 0, 1])])
  const {structuredContent: state} = await f.client.callTool({name:'pet_get_state', arguments:{}})
  assert.equal(state.facing, 'right')
  assert.equal(state.foods[0].fruit, 'apple')
  assert.deepEqual(state.otherRoom, {scene:'garden', toyDropProgress:72,
    foods:[{fruit:'banana', x:180, y:129, stage:'landed'}]})
  assert.deepEqual(state.awaitingPlay, {garden:true,nursery:false})
  assert.equal(catalog.petStateGeneration(f.board.payload.subarray(0,-1)), 0)
})

test('built-in AI makes one immediate decision from eligible actions and checks it against live state', async t => {
  const f = fixture(t)
  const saved = new Map()
  class Store { get(key) { return saved.get(key) } set(key, value) { saved.set(key, value) } }
  let timer, scheduledDelay, modelRequest, reply, beforeResponse, calls = 0, now = 10_000
  const ai = loadModule('../electron/controller/petAi.ts', {
    electron: {safeStorage:{isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from(s),decryptString:b=>b.toString()}},
    'electron-store': Store, './petMcp': f.mcp, [pathToCatalog]: catalog,
    '../../src/utils/petPersonality': loadModule('../src/utils/petPersonality.ts')
  }, {
    Date: {now: () => now},
    setTimeout(fn, ms) { scheduledDelay = ms; timer = fn; return 1 },
    clearTimeout() { timer = undefined },
    async fetch(_url, options) {
      calls++
      modelRequest = JSON.parse(options.body)
      beforeResponse?.()
      return new Response(JSON.stringify({ choices: [{ message: reply ?? {} }] }))
    }
  })
  t.after(() => ai.stopPetAi())
  const cfg = {apiUrl:'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',model:'qwen3.8-flash',
    apiKey:'secret-mcp-regression-key',personality:'胆小，喜欢在窝边观察主人。',enabled:false}
  const activity = []
  ai.startPetAi(value => activity.push(value))
  ai.savePetAi(cfg)
  const offer = (...steps) => { reply = {tool_calls:[{type:'function',function:{name:'pet_perform_sequence',arguments:JSON.stringify({steps})}}]} }
  const plan = (...actions) => offer(...Array.from({length:6}, (_, index) => ({behavior:actions[index] ?? 'rest'})))
  const actions = () => modelRequest.tools[0].function.parameters.properties.steps.items.properties.behavior.enum
  const writes = () => f.board.requests.filter(r => r.command > 0).map(r => r.value)
  const step = async () => {
    now += scheduledDelay; timer()
    while (ai.getPetAi().running) await new Promise(resolve => setImmediate(resolve))
    return ai.getPetAi().status
  }

  const auto = async () => { ai.savePetAi({...cfg, enabled:true}); return step() }
  reply = {tool_calls:[{type:'function',function:{name:'pet_feed',arguments:'{}'}}]}
  assert.equal((await ai.testPetAi('connection')).status.phase, 'error')
  offer({behavior:'blink'})
  assert.equal((await ai.testPetAi('connection')).status.phase, 'idle')
  assert.deepEqual(f.board.requests, [])

  f.board.payload = payload(5, {12:100}, [1], [98,2])
  plan()
  assert.equal((await auto()).phase, 'idle')
  assert.deepEqual(actions(), ['rest'])

  f.board.payload = payload(6, {12:67, 13:80, 14:55})
  await auto()
  assert.deepEqual(actions(), ['sleep','rest'])
  const modelInput = JSON.parse(modelRequest.messages[1].content)
  assert.equal(modelInput.personality, cfg.personality)
  assert.equal(modelInput.observation.stats.energy, 20)
  assert.equal(modelRequest.enable_thinking, false)
  assert.equal(modelRequest.tools[0].function.parameters.properties.steps.maxItems, 6)
  for (const token of [cfg.apiKey, session, 'recentActivity', 'hutchPosition'])
    assert(!JSON.stringify(modelRequest.messages).includes(token))
  assert(!f.board.requests.some(r => 'after' in r))

  f.board.payload = payload(9, {12:95, 13:0, 14:40, 15:100})
  plan('blink', 'rest', 'walk', 'rest', 'rest', 'jump')
  const requestCount = f.board.requests.length
  assert.equal((await auto()).phase, 'action')
  const roundStart = now
  const modelCalls = calls
  assert.deepEqual(f.board.requests.slice(requestCount).map(r => r.command), [0,0,3])
  assert(!actions().some(action => ['sleep','eat','flee','gaze_owner','trip_angry','binky'].includes(action)))
  assert(activity.some(a => a.step?.label === '眨眼' && a.session === session))
  assert.equal(ai.getPetAiActivity().nextDecisionAt, roundStart + 60_000)
  assert.equal(scheduledDelay, 20_000)
  assert.equal((await step()).phase, 'action')
  assert.equal(now, roundStart + 20_000)
  assert.equal(scheduledDelay, 30_000)
  f.board.payload = payload(6, {}, [], [120,1])
  assert.match((await step()).message, /状态已变化.*跳跃/)
  assert.equal(now, roundStart + 50_000)
  assert.equal(scheduledDelay, 10_000)
  assert.equal(calls, modelCalls)
  assert.equal(writes().length, 2)
  plan()
  await step()
  assert.equal(now, roundStart + 60_000)
  assert.equal(calls, modelCalls + 1)

  f.board.payload = payload(6)
  offer({behavior:'jump'})
  assert.equal((await auto()).phase, 'error')
  plan('jump')
  beforeResponse = () => { f.board.payload = payload(6, {}, [], [120,1]) }
  assert.match((await auto()).message, /状态已变化.*跳跃/)
  assert.equal(writes().length, 2)
  beforeResponse = undefined

  f.board.payload = payload(6)
  offer({behavior:'blink'})
  assert.equal((await ai.testPetAi('blink')).status.phase, 'action')
  assert.deepEqual(actions(), ['blink'])
  assert.equal(writes().length, 3)
  assert.equal(writes().at(-1), 10)
  ai.observePetAiSession(null)
  assert.equal(timer, undefined)
  ai.observePetAiSession(session)
  assert.equal(scheduledDelay, 200)
  timer()
  ai.observePetAiSession(null)
  while (ai.getPetAi().running) await new Promise(resolve => setImmediate(resolve))
  assert.equal(timer, undefined)
  assert.equal(ai.getPetAiActivity().message, '等待键盘进入养宠模式')
})

test('rabbit MCP exposes only reads and body sequences, and rejects a mixed plan before any write', async t => {
  const f=fixture(t)
  const server=f.mcp.createPetMcp(undefined,undefined,'rabbit')
  const client=new Client({name:'rabbit-permissions',version:'1'})
  const [c,s]=InMemoryTransport.createLinkedPair()
  t.after(()=>Promise.all([client.close(),server.close()]))
  await server.connect(s);await client.connect(c)
  assert.deepEqual((await client.listTools()).tools.map(tool=>tool.name).sort(),['pet_get_events','pet_get_state','pet_perform_sequence'])
  for (const behavior of ['apple','play_carrot','garden']) {
    const r=await client.callTool({name:'pet_perform_sequence',arguments:{steps:[{behavior:'blink'},{behavior}]}})
    assert(r.isError)
  }
  assert.deepEqual(f.board.requests,[])
})

test('owner inputs coalesce, interrupt stale plans and rearm a single idle round', async t => {
  const f = fixture(t)
  const config = new Map()
  class Store { get(k){ return config.get(k) } set(k,v){ config.set(k,v) } }
  const observations = []
  let timer, pollDevice, stall, expireRequest, deadline, responseSteps, waitingTouch, aborted = false
  let now = 10_000
  const ai = loadModule('../electron/controller/petAi.ts', {
    electron:{safeStorage:{isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from(s),decryptString:b=>b.toString()}},
    'node:timers':{setInterval(fn){pollDevice=fn;return 1},clearInterval(){pollDevice=undefined}},
    'node:timers/promises':{setTimeout(){return new Promise(resolve => {waitingTouch = resolve})}},
    'electron-store':Store,'./petMcp':f.mcp,'./petCareGuide':guide,[pathToCatalog]:catalog,
    '../../src/utils/petPersonality':loadModule('../src/utils/petPersonality.ts')
  }, {
    Date: {now: () => now},
    setTimeout(fn,ms){ timer={fn,ms};return timer }, clearTimeout(){ timer=undefined },
    AbortSignal: { any: AbortSignal.any, timeout(ms) {
      deadline = ms
      const controller = new AbortController()
      expireRequest = () => controller.abort()
      return controller.signal
    } },
    async fetch(_url,options) {
      observations.push(JSON.parse(JSON.parse(options.body).messages[1].content).observation)
      if (stall) await new Promise((_,reject) => options.signal.addEventListener('abort',()=>{
        aborted=true;reject(Error('aborted'))
      },{once:true}))
      const tool = JSON.parse(options.body).tools[0].function
      const message = responseSteps ? {tool_calls:[{type:'function',function:{
        name:tool.name, arguments:JSON.stringify({steps:responseSteps.map(behavior=>({behavior}))})
      }}]} : {}
      return new Response(JSON.stringify({choices:[{message}]}))
    }
  })
  const flush = () => new Promise(r=>setImmediate(r))
  const done = async () => {
    for(let i=0;i<200 && ai.getPetAi().running;i++) await flush()
    assert(!ai.getPetAi().running)
  }
  const poll = () => pollDevice()
  const runTimer = async () => { now += timer.ms;timer.fn();await done() }
  const latest = () => observations.at(-1).ownerInteractions
  t.after(()=>ai.stopPetAi())
  // The retained ring already contains a previous owner's feed when AI is enabled.
  f.board.events.push([3,1,1,1])
  ai.observePetAiSession(session)
  ai.savePetAi({apiUrl:'http://localhost/v1',model:'fixture',apiKey:'fixture',enabled:true})
  await flush()
  responseSteps = ['rest', 'jump', 'rest', 'rest', 'rest', 'rest']
  await runTimer()
  assert.deepEqual(latest(),[])
  assert.equal(timer.ms, 10_000)
  assert.equal(ai.getPetAiActivity().nextDecisionAt, now + 60_000)

  f.board.payload=payload(6,{},[],[100,1])
  f.board.events.push([18,1,1,3],[18,2,1,3],[18,2,2,3])
  await poll()
  assert.equal(timer.ms, 0)
  responseSteps = ['blink']
  timer.fn()
  for (let i=0;i<200 && !waitingTouch;i++) await flush()
  assert.equal(observations.length,2)
  assert.deepEqual(latest(),[{type:'head_petted'}])
  assert(!f.board.requests.some(r => r.command > 0))
  f.board.events.push([18,1,1,3])
  await poll()
  assert.equal(observations.length,2)
  f.board.payload=payload(6)
  waitingTouch()
  await done()
  assert.equal(f.board.requests.filter(r=>r.command>0).length,1)
  f.board.requests.length = 0
  responseSteps = undefined

  // Automatic actions, our MCP feed, toy placement, fruit landing and toy recall do not wake AI.
  const quiet = timer
  f.board.events.push([2,1,0,0],[3,1,2,1],[13,2,2,0],[4,1,1,0],[14,2,1,0])
  await poll()
  ai.observePetOwnerCommand(session,7,2,payload(6))
  assert.equal(timer,quiet)
  f.board.events.push([3,2,1,1],[13,2,1,0])
  await poll()
  await runTimer()
  assert.deepEqual(latest(),[{type:'fruit_queued',fruit:'banana'},{type:'toy_placed',toy:'carrot_toy'}])
  assert.equal(timer.ms,60_000)

  // A virtual bound key interrupts an in-flight idle inference. Polling its MCP echo cannot duplicate it.
  stall=true;timer.fn()
  for(let i=0;i<200 && observations.length<4;i++) await flush()
  assert.equal(observations.length,4)
  ai.observePetOwnerCommand(session,12,0,payload(6,{19:1}))
  await done()
  assert(aborted)
  stall=false
  f.board.events.push([3,1,2,1])
  await poll()
  await runTimer()
  assert.deepEqual(latest(),[{type:'fruit_queued',fruit:'apple'}])
  ai.observePetOwnerCommand(session,12,0,payload(6,{16:0,19:10,29:2}))
  await runTimer()
  assert.deepEqual(latest(),[{type:'toy_placed',toy:'carrot_toy'}])

  const beforePending = observations.length
  f.board.payload = payload(6, {12:58}, [1])
  ai.observePetOwnerCommand(session,2,1,f.board.payload)
  await runTimer()
  assert.equal(observations.length, beforePending + 1)
  assert(!f.board.requests.some(r => r.command > 0))

  f.board.payload = payload(6)
  stall = true
  ai.observePetOwnerCommand(session,2,3,payload(6))
  timer.fn()
  for (let i = 0; i < 200 && observations.length === beforePending + 1; i++) await flush()
  assert.equal(deadline, 4000)
  expireRequest()
  await done()
  assert.match(ai.getPetAiActivity().message, /模型超时.*眨眼/)
  assert.deepEqual(f.board.requests.filter(r => r.command > 0).map(r => r.value), [10])
  stall = false
  ai.observePetOwnerCommand(session,2,3,payload(6))
  ai.observePetAiSession(null)
  assert.equal(timer,undefined)
})
