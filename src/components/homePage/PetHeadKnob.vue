<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits<{ pat: [gesture: number]; switchMode: [] }>()
let press: { id: number; started: number; angle?: number; rotation: number; turned: boolean } | undefined
let phase = 2
let heartbeat: number | undefined

function angle(event: PointerEvent) {
  const r = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - r.left - r.width / 2, y = event.clientY - r.top - r.height / 2
  return Math.hypot(x, y) < 14 ? undefined : Math.atan2(y, x)
}

function down(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0 || press) return
  press = { id: event.pointerId, started: performance.now(), angle: angle(event), rotation: 0, turned: false }
  const button = event.currentTarget as HTMLButtonElement
  button.setPointerCapture(event.pointerId)
}

function turn(direction: 1 | 2, steps = 1) {
  if (!press) return
  if (!press.turned) {
    phase = 2
    emit('pat', direction)
    heartbeat = window.setInterval(() => emit('pat', 6), 500)
  }
  phase = (phase + (direction === 1 ? steps : -steps) % 8 + 8) % 8
  if (press.turned || steps > 1) emit('pat', (direction === 1 ? 8 : 16) + phase)
  press.turned = true
}

function move(event: PointerEvent) {
  if (!press || press.id !== event.pointerId) return
  const next = angle(event)
  if (press.angle !== undefined && next !== undefined) {
    const delta = next - press.angle
    press.rotation += Math.atan2(Math.sin(delta), Math.cos(delta))
    if (Math.abs(press.rotation) >= Math.PI / 12) {
      const steps = Math.trunc(press.rotation / (Math.PI / 12))
      turn(steps > 0 ? 1 : 2, Math.abs(steps))
      press.rotation -= steps * (Math.PI / 12)
    }
  }
  press.angle = next
}

function wheel(event: WheelEvent) {
  if (!press) return
  const delta = event.deltaY || event.deltaX
  if (!delta) return
  event.preventDefault()
  turn(delta > 0 ? 1 : 2)
}

function up(event: PointerEvent) {
  if (press?.id !== event.pointerId) return
  const { started, turned } = press
  cancel()
  if (turned) return
  if (performance.now() - started >= 1200) emit('switchMode')
  else emit('pat', 0)
}

function cancel() {
  if (press?.turned) emit('pat', 5)
  window.clearInterval(heartbeat)
  press = undefined
}
onMounted(() => window.addEventListener('blur', cancel))
onBeforeUnmount(() => { window.removeEventListener('blur', cancel); cancel() })
</script>

<template>
  <button type="button" class="rotary rotary-large head-knob"
    aria-label="旋钮 3，摸兔头" title="点击摸头；按住拖转或滚动滚轮可来回抚摸。长按不转，松开后切换模式。"
    @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="cancel"
    @lostpointercapture="cancel" @wheel="wheel" @click.stop="event => { if (event.detail === 0) emit('pat', 0) }">
    旋钮 3<small>摸兔头</small>
  </button>
</template>

<style scoped>
.head-knob { touch-action: none; user-select: none; }
.head-knob small { display: block; margin-top: 4px; font: inherit; font-size: 12px; font-weight: 400; }
</style>
