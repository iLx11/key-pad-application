<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import WindowTitle from '../components/tools/WindowTitle.vue'
import { drawGarden, drawPetEffects } from '../components/screenPage/petScene'
import { drawRabbit, rabbitAtlasUrl } from '../components/screenPage/petAnimation'

const canvas = ref<HTMLCanvasElement | null>(null)
const labels = {
  idle: '发呆',
  walk: '散步',
  sleep: '睡觉',
  eat: '吃零食',
  react: '听到按键'
}
type Action = keyof typeof labels
const action = ref<Action>('walk')

let x = 78
let direction = 1
let actionSince = 0
let lastInput = 0
let previousFrame = 0
let frameId = 0

function setAction(next: Action, now: number) {
  action.value = next
  actionSince = now
}

function interact(next: Action) {
  const now = performance.now()
  lastInput = now
  setAction(next, now)
}

function toggleSleep() {
  interact(action.value === 'sleep' ? 'idle' : 'sleep')
}

function onKeydown(event: KeyboardEvent) {
  if (event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return
  if (event.key.length !== 1 && !event.key.startsWith('Arrow')) return
  if (event.key === ' ' && event.target instanceof HTMLButtonElement) return
  interact('react')
}

function update(now: number) {
  const elapsed = now - actionSince
  if (action.value === 'sleep') return
  if (action.value === 'eat' || action.value === 'react') {
    const duration = action.value === 'eat' ? 2100 : 720
    if (elapsed >= duration) setAction('idle', now)
    return
  }
  if (now - lastInput >= 18000) {
    setAction('sleep', now)
    return
  }
  if (action.value === 'idle') {
    if (elapsed >= 1700) setAction('walk', now)
    return
  }

  x += direction * Math.min(now - previousFrame, 50) * 0.037
  if ((direction < 0 && x <= 46) || (direction > 0 && x >= 274)) {
    x = Math.max(46, Math.min(274, x))
    direction *= -1
    setAction('idle', now)
  } else if (elapsed >= 3600) {
    setAction('idle', now)
  }
}

onMounted(() => {
  const display = canvas.value?.getContext('2d')
  if (!display) return
  const background = document.createElement('canvas')
  background.width = 320
  background.height = 172
  const backdrop = background.getContext('2d')
  if (!backdrop) return
  drawGarden(backdrop)
  display.imageSmoothingEnabled = false
  const atlas = new Image()
  atlas.src = rabbitAtlasUrl
  previousFrame = lastInput = actionSince = performance.now()

  function frame(now: number) {
    if (!display) return
    update(now)
    display.drawImage(background, 0, 0)
    const elapsed = now - actionSince
    drawPetEffects(display, Math.round(x), direction, action.value, elapsed, false)
    drawRabbit(display, atlas, Math.round(x), 139, direction, action.value, elapsed)
    drawPetEffects(display, Math.round(x), direction, action.value, elapsed, true)
    previousFrame = now
    frameId = requestAnimationFrame(frame)
  }

  frameId = requestAnimationFrame(frame)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <main class="pet-preview">
    <WindowTitle fixed-size>
      <template #title>桌宠预览</template>
    </WindowTitle>
    <div class="display-info">
      <span>320 × 172</span>
      <span class="pet-state" role="status">{{ labels[action] }}</span>
    </div>
    <canvas ref="canvas" width="320" height="172" role="img" aria-label="晚霞花园里的一只像素垂耳兔" />
    <div class="pet-controls">
      <div class="pet-actions">
        <button type="button" class="feed" @click="interact('eat')">喂零食</button>
        <button type="button" @click="toggleSleep">{{ action === 'sleep' ? '叫醒' : '睡觉' }}</button>
      </div>
      <span>窗口内按字母、数字或方向键逗兔子</span>
    </div>
  </main>
</template>

<style scoped>
.pet-preview {
  width: 100%;
  min-height: 100vh;
  padding: 6px 20px 18px;
  border-radius: 18px;
  background: #211d2b;
  color: #fff4e9;
  font-family: "Microsoft YaHei UI", system-ui, sans-serif;
}

.pet-preview :deep(.top-title) {
  align-items: center;
  color: #fff4e9;
  font-size: 18px;
}

.pet-preview :deep(.window-tools button) {
  color: #fff4e9;
}

.pet-preview :deep(.window-tools button:not(.close):hover) {
  background: #51475d;
}

.display-info,
.pet-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #c9bdcb;
  font-size: 12px;
}

.display-info {
  margin: 7px 0 9px;
  font-variant-numeric: tabular-nums;
}

.pet-state {
  color: #ffe1b6;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
  background: #f6c49f;
  image-rendering: pixelated;
}

.pet-controls {
  margin-top: 14px;
}

.pet-actions {
  display: flex;
  gap: 8px;
}

button {
  min-width: 78px;
  padding: 8px 13px;
  border: 1px solid #756775;
  border-radius: 7px;
  background: #352e40;
  color: #fff4e9;
  font: inherit;
  cursor: pointer;
}

button.feed {
  border-color: #ffd3a4;
  background: #ffd3a4;
  color: #3a2130;
}

button:hover {
  filter: brightness(1.14);
}

button:focus-visible {
  outline: 2px solid #ffd3a4;
  outline-offset: 3px;
}
</style>
