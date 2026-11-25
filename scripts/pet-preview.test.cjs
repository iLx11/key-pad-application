const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

function compile(source) {
  return ts.transpileModule(readFileSync(resolve(__dirname, source), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText
}
const catalog = {}
vm.runInNewContext(compile('../src/utils/petCatalog.ts'), { exports: catalog })
const outputText = compile('../src/components/screenPage/petItemPreview.ts')

function preview(satiety = 65) {
  let now = 0
  let update
  let bedtime = false
  const context = { exports: {}, require: module => {
    assert.equal(module, '../../utils/petCatalog')
    return catalog
  }, Date: { now: () => now }, window: {
    setInterval(fn) { update = fn; return 1 },
    clearInterval() { update = undefined }
  } }
  vm.runInNewContext(outputText, context)
  const state = { scene: 0, x: 128, action: 1, hutchPosition: { ...catalog.defaultHutchPosition },
    stats: { ...context.exports.previewCare, satiety } }
  const world = context.exports.createPetItemPreview(() => state, on => { bedtime = on })
  world.start()
  function tick(ms) {
    for (let elapsed = 0; elapsed < ms; elapsed += 25) {
      now += 25
      update?.()
    }
  }
  return { world, state, tick, sleeping: () => bedtime }
}

test('head strokes overlay bedtime and late detents of the same press earn no extra reward', () => {
  const { world, state, tick, sleeping } = preview(100)
  world.use(3, 2)
  tick(2500)
  assert.ok(sleeping())
  world.use(22, 1)
  assert.equal(state.headPatKind, 1)
  assert.equal(state.headPatRemaining, 1200)
  assert.deepEqual(state.stats, { satiety: 100, energy: 75, mood: 71, affection: 36 })
  tick(1400)
  world.use(22, 4)
  assert.equal(state.headPatKind, 2)
  assert.equal(state.headPatRemaining, 1200)
  assert.equal(state.stats.affection, 36)
  assert.equal(state.action, 2)
  assert.ok(sleeping())
  tick(1200)
  world.use(22, 0)
  assert.equal(state.stats.affection, 37)
  assert.equal(state.stats.satiety, 100)
})

test('an alert rabbit stays awake and a held stroke freezes its route to the hutch', () => {
  const {world, state, tick, sleeping} = preview()
  state.stats.energy = 100
  tick(21000)
  assert(!sleeping())
  state.stats.energy = 74
  world.use(3,2)
  tick(275)
  world.use(22,1)
  const x = state.x
  const phase = state.headPatPhase
  tick(450)
  assert.equal(state.x,x)
  assert.equal(state.headPatPhase,phase)
  world.use(22,12)
  assert.equal(state.headPatPhase,6)
  world.use(22,5)
  tick(550)
  assert.notEqual(state.x,x)
})

test('the rabbit kicks forward, turns in the air and lands facing back before fetching a snack', () => {
  const {world, state, tick} = preview()
  assert.deepEqual([0, 50, 80, 100].map(catalog.binkyChance), [4, 14, 29, 44])
  assert.equal(world.use(3, 15), '')
  const origin = state.x
  world.use(2, 1)
  tick(300)
  assert.equal(state.facing, 1)
  assert.ok(state.x > origin)
  tick(400)
  assert.equal(state.action, 15)
  assert.equal(state.facing, -1)
  assert.ok(catalog.binkyMotion(state.actionAgeMs).lift > 0)
  tick(425)
  assert.equal(state.x, origin + 36)
  assert.equal(state.facing, -1)
  assert.equal(catalog.binkyMotion(1125).lift, 0)
  tick(100)
  assert.equal(state.action, 5)
})

test('manual edits set only the chosen stat and reject invalid input', () => {
  const {world, state} = preview()
  for (const [opcode, value] of [[23,0], [24,100], [25,52], [26,83]]) assert.equal(world.use(opcode, value), '')
  assert.ok(world.use(25, 101))
  assert.ok(world.use(25, 3.5))
  assert.deepEqual(state.stats, {satiety:0, energy:100, mood:52, affection:83})
})

test('continuous running spends both energy and fullness before the base minute elapses', () => {
  const {world,state,tick} = preview()
  const {energy,satiety} = state.stats
  for(let i=0;i<15;i++){
    world.use(3,6)
    tick(2000)
  }
  assert.equal(state.stats.energy,energy-1)
  assert.equal(state.stats.satiety,satiety-1)
})

test('good care takes ten minutes and poor care takes five minutes to change affection', () => {
  const {state, tick} = preview(100)
  state.stats.energy = 100
  tick(599975)
  assert.equal(state.stats.affection, 35)
  tick(25)
  assert.equal(state.stats.affection, 36)
  state.stats.mood = 30
  tick(300000)
  assert.equal(state.stats.affection, 35)
})

test('each grooming action stays in place and completes without an interaction reward', () => {
  const {world, state, tick} = preview()
  for (const [id, duration] of [[16, 2500], [17, 3000]]) {
    const before = { ...state.stats }, x = state.x
    assert.equal(world.use(3, id), '')
    tick(duration - 25)
    assert.equal(state.action, id)
    tick(25)
    assert.equal(state.action, 0)
    assert.equal(state.x, x)
    assert.deepEqual(state.stats, before)
  }
})

test('the nursery table has a fixed approach and paw contact without a care reward', () => {
  const {world,state,tick} = preview()
  assert.ok(world.use(3,14))
  world.changeScene(1)
  const before = {...state.stats}
  assert.equal(world.use(3,14),'')
  assert.equal(state.activeToy,3)
  tick(1700)
  assert.equal(state.action,14)
  assert.equal(state.x,98)
  assert.equal(state.rabbitY,116)
  assert.equal(state.facing,-1)
  tick(4200)
  assert.equal(state.activeToy,0)
  assert.equal(state.rabbitY,139)
  assert.deepEqual(state.stats,before)
})

test('each snack lands independently and surplus food waits until the rabbit is hungry', () => {
  const { world, state, tick } = preview()
  for (const id of [1, 1, 2, 3]) world.use(2, id)
  assert.equal(new Set(state.foods.map(f => f.x)).size, 4)
  tick(325)
  assert.equal(state.foods[0].y, Math.floor(-9 + 69 * .5 * 1.5))
  tick(12000)
  assert.equal(state.stats.satiety, 100)
  assert.equal(state.stats.mood, 79)
  assert.equal(state.stats.affection, 41)
  assert.equal(state.foods.length, 1)
  assert.equal(state.foods[0].stage, 1)
  // Near-full rabbits leave surplus food on the ground.
  state.stats.energy = 100
  tick(60000)
  assert.equal(state.scene, 0)
  assert.equal(state.stats.satiety, 99)
  assert.equal(state.stats.affection, 41)
  assert.equal(state.foods.length, 1)
  state.stats.satiety = 89
  tick(4000)
  assert.equal(state.stats.affection, 43)
  assert.equal(state.foods.length, 0)
})

test('a full rabbit stays asleep with food nearby and wakes when hungry', () => {
  const { world, state, tick, sleeping } = preview(100)
  world.use(3, 2)
  tick(2300)
  assert.equal(state.scene, 1)
  assert.equal(state.action, 2)
  world.use(2, 1)
  tick(3200)
  assert.ok(sleeping())
  assert.equal(state.foods[0].stage, 1)
  tick(60000)
  assert.equal(state.foods.length, 1)
  state.stats.satiety = 89
  tick(4000)
  assert.equal(state.foods.length, 0)
  assert.equal(state.stats.satiety, 100)
  assert.ok(!sleeping())
})

test('switching rooms interrupts a bite without consuming or rewarding it twice', () => {
  const { world, state, tick } = preview()
  world.use(2, 1)
  for (let i = 0; i < 120 && state.foods[0].stage !== 2; i++) tick(25)
  assert.equal(state.foods[0].stage, 2)
  world.changeScene(1)
  tick(1000)
  assert.equal(state.stats.satiety, 65)
  world.changeScene(0)
  assert.equal(state.foods.length, 1)
  tick(1500)
  assert.equal(state.foods.length, 0)
  assert.equal(state.stats.satiety, 77)
})

test('completed toy interactions and gestures reward once each, recalled toys do not', () => {
  const { world, state, tick } = preview()
  world.use(7, 2)
  tick(300)
  assert.equal(state.toyDrop, 46)
  world.use(7, 2)
  tick(3000)
  assert.equal(state.deployedToys[0], 0)
  assert.equal(state.stats.mood, 70)
  world.use(7, 2)
  tick(4000)
  assert.equal(state.deployedToys[0], 2)
  assert.equal(state.activeToy, 0)
  assert.equal(state.stats.energy, 73)
  assert.equal(state.stats.mood, 76)
  world.use(11, 2)
  tick(2600)
  world.use(15, 0)
  tick(7000)
  assert.equal(state.stats.energy, 83)
  assert.equal(state.stats.mood, 87)
  world.use(3, 11)
  tick(2100)
  assert.equal(state.stats.mood, 83)
  world.use(3, 12)
  tick(3100)
  assert.equal(state.stats.mood, 84)
  assert.equal(state.stats.affection, 42)
})

test('the hutch moves independently of the carrot, including during approach and rest', () => {
  const { world, state, tick, sleeping } = preview()
  world.changeScene(1)
  world.use(7, 2)
  tick(4000)
  assert.equal(state.deployedToys[1], 2)
  world.use(14, 255 | (120 << 9))
  world.use(3, 2)
  tick(450)
  assert.ok(state.x > 151 && state.x < 255)
  assert.ok(state.rabbitY < 139 && state.rabbitY > 120)
  const startY = state.rabbitY
  world.use(14, 130 | (160 << 9))
  tick(150)
  assert.ok(state.rabbitY > startY)
  tick(1500)
  assert.deepEqual([state.x, state.rabbitY], [130, 160])
  assert.ok(sleeping())
  world.use(7, 2)
  assert.equal(state.deployedToys[1], 0)
  assert.ok(sleeping())
  world.use(14, 41 | (69 << 9))
  assert.deepEqual([state.x, state.rabbitY], [41, 69])
  assert.ok(world.use(14, 281 | (68 << 9)))
  assert.deepEqual([state.x, state.rabbitY], [41, 69])
  world.use(14, 280 | (167 << 9))
  assert.deepEqual([state.x, state.rabbitY], [280, 167])
  world.use(15, 0)
  assert.ok(sleeping())
  world.use(3, 0)
  assert.equal(state.rabbitY, 139)
  assert.equal(state.hutchPosition.x, 280)
  world.use(15, 0)
  tick(5500)
  assert.equal(state.activeToy, 0)
  assert.equal(state.stats.energy, 85)
  assert.equal(state.deployedToys[1], 0)
})
