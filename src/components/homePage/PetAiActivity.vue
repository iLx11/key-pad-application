<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ session?: string }>()
const emit = defineEmits<{ (e: 'step-accepted', session: string): void }>()
interface Activity {
  version: number
  enabled: boolean
  session?: string
  phase: string
  message: string
  step?: { label: string; index: number; total: number; next?: string }
  lastDecision?: string
  nextDecisionAt?: number
}

const api = (window as any).myApi
const activity = ref<Activity>()
const unavailable = ref(false)
const now = ref(Date.now())
let unsubscribe: (() => void) | undefined
let clock: number | undefined

function update(value: Activity, live = false) {
  if (activity.value && value.version <= activity.value.version) return
  activity.value = value
  now.value = Date.now()
  if (live && value.enabled && value.session === props.session && value.session && value.phase === 'action' && value.step) {
    emit('step-accepted', value.session)
  }
}
onMounted(async () => {
  unsubscribe = api.onPetAiActivity((value: Activity) => update(value, true))
  clock = window.setInterval(() => { if (activity.value?.nextDecisionAt) now.value = Date.now() }, 1000)
  try { update(await api.getPetAiActivity()) } catch { unavailable.value = true }
})
onUnmounted(() => { unsubscribe?.(); window.clearInterval(clock) })

const display = computed(() => {
  const a = activity.value
  let standby = ''
  if (!a) standby = unavailable.value ? '暂时无法读取' : '正在读取'
  else if (!a.enabled) standby = '未启用'
  else if (!props.session) standby = '等待连接养宠键盘'
  else if (a.session && a.session !== props.session) standby = '等待本次连接的决策'
  if (!a || standby) return { text: standby, tone: 'muted' }

  const step = a.step
  if (step) return { text: step.label, tone: 'active', stage: a.phase === 'action' ? '键盘已接收' : '准备执行',
    progress: step.index + '/' + step.total, next: step.next }
  const tone = a.phase === 'error' || a.phase === 'unconfirmed' ? 'error' : a.phase === 'thinking' ? 'thinking' : 'idle'
  const seconds = a.nextDecisionAt ? Math.max(0, Math.ceil((a.nextDecisionAt - now.value) / 1000)) : undefined
  return { text: a.lastDecision ?? a.message, tone, stage: a.lastDecision ? '上次决定' : undefined,
    countdown: seconds === undefined ? undefined : seconds ? seconds + ' 秒后决策' : '即将决策' }
})
</script>

<template>
  <div class="ai-activity" :data-tone="display.tone" :title="[activity?.enabled && props.session === activity?.session ? activity?.message : display.text, display.next && '接下来 · ' + display.next].filter(Boolean).join('　')">
    <div class="caption">
      <strong>AI 决策</strong><span>{{ display.stage }}</span>
      <span class="counter" aria-hidden="true">{{ display.progress || display.countdown }}</span>
    </div>
    <div class="decision" role="status" aria-atomic="true">
      <b>{{ display.text }}</b><span v-if="display.next">接下来 · {{ display.next }}</span>
    </div>
  </div>
</template>

<style scoped>
.ai-activity {
  grid-area: 3 / 4 / 4 / 8;
  min-width: 0;
  display: grid;
  align-content: center;
  gap: 1px;
  padding: 2px 9px;
  color: #203e3b;
  background: #e9efed;
  border-radius: 8px;
}
.caption, .decision { display: flex; align-items: baseline; gap: 7px; min-width: 0; }
.caption { font-size: 10px; line-height: 13px; color: #49615d; }
.caption strong { font-size: 11px; }
.counter { margin-left: auto; font-variant-numeric: tabular-nums; }
.decision { line-height: 16px; }
.decision b, .decision span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.decision b { font-size: 13px; font-weight: 650; }
.decision span { color: #4f6561; font-size: 11px; }
[data-tone="active"] { background: #dceee5; }
[data-tone="thinking"] { background: #e3ecf3; color: #294e66; }
[data-tone="error"] { background: #f5e7e3; color: #853c30; }
[data-tone="muted"] .decision b { font-weight: 500; color: #536660; }
</style>
