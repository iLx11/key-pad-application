<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { drawCarrotToy, drawGarden, drawPetEffects, drawNursery, drawNurseryHutch, drawNurseryLight, drawSceneClock, tintNursery, type PetAction } from './petScene'
import { bitePosition, drawRabbit, drawRabbitHeadPat, rabbitAtlasUrl } from './petAnimation'
import { patPhase } from './petHeadPat'
import itemsUrl from '../../assets/pet/items.png'
import type { HutchPosition, PetState } from './petDisplay'
import { binkyMotion, defaultHutchPosition, hutchBounds, petActions, petSceneLabels, petScenes } from '../../utils/petCatalog'

const props = defineProps<{ state: PetState; connected: boolean; editableDecoration?: boolean; decorationBusy?: boolean }>()
const emit = defineEmits<{ moveHutch: [position: HutchPosition] }>()
const canvas = ref<HTMLCanvasElement>()
const hutchButton = ref<HTMLButtonElement>()
const dragging = ref<HutchPosition>()
const hutchAt = computed(() => dragging.value ?? props.state.hutchPosition ?? defaultHutchPosition)
const showHandle = computed(() => !!props.editableDecoration && props.state.scene === 1 && !!props.state.hutchPosition)
const canMove = computed(() => showHandle.value && !props.decorationBusy)
const handleStyle = computed(() => ({
  left: (hutchAt.value.x - 41) / 320 * 100 + '%',
  top: (hutchAt.value.y - 69) / 172 * 100 + '%'
}))
let grab: { pointerId: number; x: number; y: number } | undefined

function limitPosition(x: number, y: number): HutchPosition {
  return { x: Math.max(hutchBounds.minX, Math.min(hutchBounds.maxX, Math.round(x))),
    y: Math.max(hutchBounds.minY, Math.min(hutchBounds.maxY, Math.round(y))) }
}

function scenePoint(event: PointerEvent) {
  const bounds = canvas.value!.getBoundingClientRect()
  return { x: (event.clientX - bounds.left) * 320 / bounds.width, y: (event.clientY - bounds.top) * 172 / bounds.height }
}

function startDrag(event: PointerEvent) {
  if (!canMove.value || !event.isPrimary || event.button !== 0 || grab) return
  const pos = scenePoint(event)
  grab = { pointerId: event.pointerId, x: pos.x - hutchAt.value.x, y: pos.y - hutchAt.value.y }
  dragging.value = { ...hutchAt.value }
  hutchButton.value?.setPointerCapture(event.pointerId)
}

function moveDrag(event: PointerEvent) {
  if (!grab || grab.pointerId !== event.pointerId) return
  const pos = scenePoint(event)
  dragging.value = limitPosition(pos.x - grab.x, pos.y - grab.y)
}

function cancelDrag() {
  const id = grab?.pointerId
  grab = undefined
  dragging.value = undefined
  if (id !== undefined && hutchButton.value?.hasPointerCapture(id)) hutchButton.value.releasePointerCapture(id)
}

function savePosition(position: HutchPosition) {
  if (canMove.value && (position.x !== props.state.hutchPosition?.x || position.y !== props.state.hutchPosition?.y))
    emit('moveHutch', position)
}

function endDrag(event: PointerEvent) {
  if (grab?.pointerId !== event.pointerId) return
  moveDrag(event)
  const position = dragging.value
  cancelDrag()
  if (position) savePosition(position)
}

const arrowSteps: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]
}
function nudge(event: KeyboardEvent) {
  if (event.key === 'Escape' && grab) { event.preventDefault(); cancelDrag(); return }
  const step = arrowSteps[event.key]
  if (!step || grab) return
  event.preventDefault()
  const size = event.shiftKey ? 8 : 1
  savePosition(limitPosition(hutchAt.value.x + step[0] * size, hutchAt.value.y + step[1] * size))
}
watch(canMove, enabled => { if (!enabled) cancelDrag() })

const nurseryShadowRadii = [14, 19, 18, 12]
let frameId = 0

onMounted(() => {
  const display = canvas.value?.getContext('2d')
  const background = document.createElement('canvas')
  background.width = 320
  background.height = 172
  const context = background.getContext('2d')
  if (!display || !context) return
  const hutch = document.createElement('canvas')
  hutch.width = 81
  hutch.height = 74
  const hutchContext = hutch.getContext('2d')!
  hutchContext.translate(-205, -73)
  const items = new Image()
  items.src = itemsUrl
  display.imageSmoothingEnabled = false
  const seasonTints = ['#96b86618', '#ffeb6f17', '#da72372b', '#bdddfd3d']
  const atlas = new Image()
  atlas.src = rabbitAtlasUrl
  let lastAction = -1
  let lastScene = -1
  let lastLighting = -1
  let actionStart = 0
  let lastSample: PetState | undefined
  let lastFoods: PetState['foods']
  let lastDrop: number | undefined
  let syncAge = -1, syncAt = 0
  let sampleAt = 0
  let lastPatState: PetState | undefined
  let lastRemaining = 0, lastPatKind = 0
  let patStarted = 0, patUntil = 0
  let x = 128
  let direction = 1
  function frame(now: number) {
    const { action, x: position, hour, season, scene, activeToy, toyPhase } = props.state
    const { deployedToys, foods, toyDrop } = props.state
    const remaining = props.state.headPatRemaining ?? 0
    const patKind = props.state.headPatKind ?? 0
    if (props.state !== lastPatState || remaining !== lastRemaining || patKind !== lastPatKind) {
      if (remaining && now >= patUntil) patStarted = now - (1200 - remaining)
      patUntil = remaining ? now + remaining : 0
      lastRemaining = remaining
      lastPatState = props.state
      lastPatKind = patKind
    }
    if (lastSample !== props.state || lastFoods !== foods || lastDrop !== toyDrop) {
      lastSample = props.state
      lastFoods = foods
      lastDrop = toyDrop
      sampleAt = now
    }
    const nursery = petScenes[scene] === 'nursery'
    const liveNurseryLight = nursery && (!props.connected || props.state.minute !== undefined)
    const lighting = liveNurseryLight ? (season * 24 + hour) * 60 + (props.state.minute ?? 0) : -1
    if (lastScene !== scene || lastLighting !== lighting) {
      if (nursery) {
        drawNursery(context!, liveNurseryLight ? hour : 12, liveNurseryLight ? props.state.minute ?? 0 : 0)
        hutchContext.clearRect(205, 73, hutch.width, hutch.height)
        drawNurseryHutch(hutchContext)
        if (liveNurseryLight) {
          drawNurseryLight(context!, hour, season)
          hutchContext.save()
          hutchContext.globalCompositeOperation = 'source-atop'
          tintNursery(hutchContext, hour, season)
          hutchContext.restore()
        }
      } else drawGarden(context!)
      lastScene = scene
      lastLighting = lighting
    }
    const fixedDecoration = !!props.state.hutchPosition
    const home = hutchAt.value
    const inHutch = nursery && activeToy === 1
    const resting = inHutch && toyPhase === 2
    const stateAction = petActions[action] ?? 'idle'
    const touched = now < patUntil && props.state.headPatPhase !== undefined
    const clip: PetAction = touched && stateAction !== 'sleep' ? 'idle' : stateAction === 'fetch' ? 'walk' :
      stateAction === 'fall' || stateAction === 'jump' ? 'react' : stateAction
    const roaming = clip === 'walk' || clip === 'run' || clip === 'flee'
    const playingCarrot = activeToy === 2
    const followingFood = !!foods?.length && (stateAction === 'fetch' || stateAction === 'eat')
    const target = props.connected || followingFood || activeToy === 3 || (props.state.rabbitY ?? 139) < 139 ? position : inHutch ? home.x : playingCarrot ? 151 : roaming ? 160 + Math.sin(now / 1750) * 94 : x
    if (props.connected && props.state.facing) direction = props.state.facing
    else if (!touched && Math.abs(target - x) > 1) direction = target > x ? 1 : -1
    const eating = foods?.find(food => food.stage === 2)
    if (eating && stateAction === 'eat') {
      x = position
      direction = eating.x >= x ? 1 : -1
    } else if (touched && props.connected) x = position
    else if (!touched) x += (target - x) * (inHutch && !props.connected ? .055 : .14)
    if (activeToy === 3 && toyPhase === 2) { x = position; direction = -1 }
    if (resting) { x = home.x; direction = -1 }
    if (playingCarrot && toyPhase === 2) { x = 151; direction = 1 }
    let rabbitY = resting ? home.y : (props.state.rabbitY ?? 139)
    const actionChanged = lastAction !== action
    if (actionChanged) {
      lastAction = action
      actionStart = now
    }
    const shadowY = rabbitY
    const wireAge = props.state.actionAgeMs
    if ((wireAge ?? -1) !== syncAge || actionChanged) {
      syncAge = wireAge ?? -1
      syncAt = now
    }
    const elapsed = wireAge === undefined ? now - actionStart : wireAge + (touched ? 0 : now - syncAt)
    if (stateAction === 'binky' && wireAge !== undefined) {
      const observed = binkyMotion(wireAge), animated = binkyMotion(elapsed)
      const originalFacing = (props.state.facing ?? 1) * observed.facing
      x = position + originalFacing * (animated.travel - observed.travel)
      direction = originalFacing * animated.facing
      rabbitY -= animated.lift
    }
    display!.drawImage(background, 0, 0)
    if (!nursery) {
      display!.fillStyle = seasonTints[season] ?? seasonTints[0]
      display!.fillRect(0, 0, 320, 172)
      if (hour < 6 || hour >= 20) {
        display!.fillStyle = '#17274688'
        display!.fillRect(0, 0, 320, 172)
      }
      drawPetEffects(display!, Math.round(x), direction, clip, elapsed, false,
        !activeToy && !props.state.fruit)
    }
    if (nursery && toyPhase !== 2) {
      display!.fillStyle = 'rgba(130, 108, 107, .2)'
      nurseryShadowRadii.forEach((radius, row) =>
        display!.fillRect(Math.round(x) - radius, shadowY - 1 + row, radius * 2, 1))
    }
    const deployed = deployedToys?.[scene] ?? (nursery ? 1 : 0)
    const drop = Math.min(1, (toyDrop ?? 100) / 100 + (now - sampleAt) / 650)
    const dy = -Math.round(146 * (1 - drop))
    if (nursery && (fixedDecoration || deployed === 1))
      display!.drawImage(hutch, home.x - 41, home.y - 69 + (fixedDecoration ? 0 : dy))
    if (deployed === 2) {
      display!.save()
      display!.translate(0, dy)
      drawCarrotToy(display!, playingCarrot && toyPhase === 2, elapsed)
      display!.restore()
    }
    const phase = now < patUntil ? (patKind && props.state.headPatPhase !== undefined && patUntil - now > 200
      ? props.state.headPatPhase : patPhase(now - patStarted, patUntil - now)) : undefined
    const drawFood = (id: number, cx: number, cy: number) =>
      display!.drawImage(items, (id - 1) * 16 + 3, 3, 9, 9, cx - 9, cy - 9, 18, 18)
    if (foods && items.complete && items.naturalWidth) {
      for (const food of foods) {
        if (food.stage === 2 || food.id < 1 || food.id > 8) continue
        // The device reports the centre of each falling fruit; advance its arc between USB samples.
        const initial = Math.max(0, Math.min(1, (food.y + 9) / 138))
        const t = Math.min(1, (Math.sqrt(1 + 8 * initial) - 1) / 2 + (now - sampleAt) / 650)
        const y = food.stage === 0 ? Math.round(-9 + 69 * t * (1 + t)) : food.y
        drawFood(food.id, food.x, y)
      }
    }
    const pose = drawRabbit(display!, atlas, Math.round(x), rabbitY, direction, clip, elapsed, phase)
    if (resting) display!.drawImage(hutch, 21, 63, 40, 4, home.x - 20, home.y - 6, 40, 4)
    if (eating && items.complete && items.naturalWidth) {
      const bite = pose === undefined ? undefined : bitePosition(Math.round(x), rabbitY, direction, pose)
      drawFood(eating.id, bite?.x ?? eating.x, bite?.y ?? eating.y)
    }
    display!.save()
    display!.translate(0, rabbitY - (resting ? 142 : 139))
    drawPetEffects(display!, Math.round(x), direction, clip, elapsed, true)
    display!.restore()
    if (phase !== undefined && pose !== undefined)
      drawRabbitHeadPat(display!, Math.round(x), rabbitY, direction, pose, touched && patKind ? 1 : patKind, phase)
    drawSceneClock(display!, hour, props.state.minute ?? 0)
    frameId = requestAnimationFrame(frame)
  }
  frameId = requestAnimationFrame(frame)
})
onUnmounted(() => cancelAnimationFrame(frameId))
</script>

<template>
  <div class="pet-scene">
    <canvas ref="canvas" width="320" height="172" :aria-label="petSceneLabels[petScenes[state.scene]] + '里的垂耳兔'" role="img" />
    <button v-if="showHandle" ref="hutchButton" class="hutch-handle" :class="{ dragging }" :style="handleStyle"
      type="button" :aria-disabled="!canMove" aria-label="移动兔窝" title="拖动兔窝，或用方向键微调"
      @pointerdown="startDrag" @pointermove="moveDrag" @pointerup="endDrag"
      @pointercancel="cancelDrag" @lostpointercapture="cancelDrag" @keydown="nudge"></button>
  </div>
</template>

<style scoped>
.pet-scene { position: relative; width: 100%; aspect-ratio: 320 / 172; overflow: hidden; border-radius: inherit; }
canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; }
.pet-scene .hutch-handle { position:absolute; width:25.3125%; height:43.0233%; box-sizing:border-box;
  padding:0; margin:0; background:transparent; border:1px dashed rgb(39 86 75 / 70%);
  border-radius:9px; cursor:grab; touch-action:none; }
.hutch-handle:hover,.hutch-handle:focus-visible,.hutch-handle.dragging { outline:2px solid #276550; outline-offset:-2px; }
.hutch-handle.dragging { cursor:grabbing; }
</style>
