<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import WindowTitle from '../components/tools/WindowTitle.vue'
import PopBox from '../components/tools/PopBox.vue'
import ScreenEditor from '../components/screenPage/screenEditor.vue'
import PerformanceDisplay from '../components/screenPage/PerformanceDisplay.vue'
import { encodeOled, renderScreenContent } from '../components/screenPage/screenContent'
import type { ScreenContent, ScreenFrame } from '../components/screenPage/screenContent'

const win = window as any
const route = useRoute()
const screen = [0, 1, 2].includes(Number(route.query.screen)) ? Number(route.query.screen) : 0
const menu = Math.min(9, Math.max(0, Number(route.query.menu) || 0))
const initial = ref<ScreenFrame>()
const loaded = ref(false)
const mode = ref<ScreenContent['mode'] | 'image'>(screen === 0 ? 'image' : 'time')
const text = ref('')
const url = ref('')
const field = ref('')
const label = ref('')
const interval = ref(60)
const preview = ref('')
const imageMounted = ref(false)
const busy = ref(false)
const error = ref('')
const performanceValues = ref<number[]>([])
let performanceTimer: number | undefined
const modes = screen === 0 ? [
  { value: 'image', label: '图片' },
  { value: 'performance', label: '电脑性能监测' }
] as const : [
  { value: 'image', label: '图片' },
  { value: 'time', label: '时间' },
  { value: 'date', label: '日期' },
  { value: 'datetime', label: '时间和日期' },
  { value: 'text', label: '自定义文字' },
  { value: 'api', label: 'API 数据' }
] as const

onMounted(async () => {
  try {
    const saved = await win.myApi.getMenu('configData')
    initial.value = saved ? JSON.parse(saved)?.[menu]?.screenConfig?.[screen] : undefined
    const content = initial.value?.content
    if (content && modes.some(option => option.value === content.mode)) {
      mode.value = content.mode
      if (content.mode === 'api') {
        url.value = content.url
        field.value = content.field
        label.value = content.label
        interval.value = content.interval
      } else if (content.mode === 'text') {
        text.value = content.text
      }
    } else if (initial.value?.baseData) {
      mode.value = 'image'
    }
  } catch {
    error.value = '读取屏幕配置失败'
  } finally {
    loaded.value = true
  }
})

const content = computed<ScreenContent | undefined>(() => {
  switch (mode.value) {
    case 'image':
    case 'pet': return
    case 'text': return { mode: 'text', text: text.value.trim() }
    case 'api': return { mode: 'api', url: url.value.trim(), field: field.value.trim(), label: label.value.trim(), interval: interval.value }
    default: return { mode: mode.value }
  }
})

watch([loaded, content], async ([ready, current], _previous, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  preview.value = ''
  if (!ready || !current || current.mode === 'performance' || current.mode === 'api' || (current.mode === 'text' && !current.text)) return
  const png = await renderScreenContent(current)
  if (!cancelled) preview.value = png
})

watch([loaded, mode], ([ready, value]) => {
  if (ready && value === 'image') imageMounted.value = true
  window.clearInterval(performanceTimer)
  if (value !== 'performance') return
  const sample = async () => { performanceValues.value = await win.myApi.pcPerformance().catch(() => []) }
  void sample()
  performanceTimer = window.setInterval(sample, 2000)
})
onUnmounted(() => window.clearInterval(performanceTimer))

const close = () => win.myApi.closeWindow()
const save = (frame: ScreenFrame) => {
  win.myApi.setConfigStore({ screenFrame: { screen, menu, frame } })
  close()
}

const generate = async (commit: boolean) => {
  const current = content.value
  if (busy.value || !current) return
  error.value = ''
  if (current.mode === 'performance') {
    save({ baseData: initial.value?.baseData ?? '', buffData: [...(initial.value?.buffData ?? [])], content: current })
    return
  }
  if (current.mode === 'api' && (!Number.isInteger(current.interval) || current.interval < 15 || current.interval > 3600)) {
    error.value = '刷新间隔须为 15 至 3600 秒'
    return
  }
  busy.value = true
  try {
    const png = await renderScreenContent(current)
    if (content.value !== current) return
    preview.value = png
    if (commit) {
      const frame = await encodeOled(png)
      if (current.mode !== 'text') frame.buffData = []
      save({ ...frame, content: current })
    }
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : '生成屏幕内容失败'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <PopBox />
  <div class="container">
    <WindowTitle>
      <template #title>{{ screen ? `小屏 ${screen} · 菜单 ${menu + 1}` : '彩屏编辑' }}</template>
    </WindowTitle>
    <nav class="screen-modes" aria-label="显示内容">
      <button v-for="option in modes" :key="option.value" type="button" :aria-pressed="mode === option.value"
        :disabled="!loaded || busy" @click="mode = option.value; error = ''">{{ option.label }}</button>
    </nav>
    <div v-if="imageMounted" v-show="mode === 'image'" class="image-editor">
      <ScreenEditor :screen="screen" :initial-image="screen && initial?.content ? undefined : initial?.baseData" @save="save" />
    </div>
    <form v-if="loaded && mode !== 'image'" class="screen-settings" @submit.prevent="generate(true)">
      <div class="screen-preview">
        <PerformanceDisplay v-if="mode === 'performance'" :values="performanceValues" />
        <img v-else-if="preview" :src="preview" alt="小屏预览" />
        <span v-else>{{ mode === 'api' ? '测试后预览' : '小屏预览' }}</span>
      </div>
      <div class="screen-fields">
        <template v-if="mode === 'api'">
          <label>API 地址<input v-model="url" type="url" maxlength="2048" placeholder="https://api.example.com/status" required :disabled="busy" /></label>
          <label>JSON 字段路径<input v-model="field" maxlength="256" placeholder="例如 data.temperature，纯文本可留空" :disabled="busy" /></label>
          <label>屏幕标题（可选）<input v-model="label" maxlength="20" placeholder="例如 室温" :disabled="busy" /></label>
          <label>刷新间隔（秒）<input v-model.number="interval" type="number" min="15" max="3600" required :disabled="busy" /></label>
        </template>
        <label v-else-if="mode === 'text'">显示文字<textarea v-model="text" rows="2" maxlength="50" placeholder="最多显示两行" required :disabled="busy" /></label>
        <p v-if="mode === 'performance'" class="screen-hint">显示 CPU 使用率、内存占用率和系统盘容量占用率。初次配置菜单后请点击主页面的「发送到键盘」。实时显示需要配套固件、USB 连接和正在运行的 MultiPad。</p>
        <p v-else-if="mode !== 'text'" class="screen-hint">首次设置后，请在主页面点击「发送」。动态显示需要支持该功能的固件、USB 连接和正在运行的 MultiPad。</p>
        <p v-if="error" class="screen-error" role="alert">{{ error }}</p>
        <div class="screen-actions">
          <button type="button" @click="close">取消</button>
          <button v-if="mode === 'api'" type="button" :disabled="busy" @click="generate(false)">测试 API</button>
          <button type="submit" :disabled="busy">{{ busy ? '处理中…' : '保存设置' }}</button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
  padding: 10px 16px 16px;
  border: 6px solid #0f1017;
  border-radius: 2.5em;
  overflow: hidden;
  background: linear-gradient(135deg, #d9c6c6, #c9e0e5 87%, #cfdcdd);
  color: #202830;
  display: flex;
  flex-direction: column;
}
.container :deep(.top-title) { color: #24323a; }
.screen-modes {
  display: flex;
  gap: 8px;
  padding: 8px 12px 14px;
  -webkit-app-region: no-drag;
}
button, input, textarea {
  font: inherit;
}
button {
  cursor: pointer;
  color: #24323a;
  border: 1px solid #aab7bd;
  border-radius: 8px;
  background: #f8fafb;
  padding: 8px 14px;
}
button:disabled { opacity: .6; cursor: wait; }
button[aria-pressed="true"], button[type="submit"] {
  background: #263d46;
  color: white;
  border-color: #263d46;
}
.image-editor {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}
.screen-settings {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(340px, 1.4fr);
  gap: 26px;
  padding: 24px;
  min-height: 0;
  overflow: auto;
  background: #ffffffb3;
  border-radius: 16px;
}
.screen-preview {
  width: 100%;
  align-self: start;
  aspect-ratio: 72 / 40;
  display: grid;
  place-items: center;
  background: #000;
  color: #bec8ca;
  border-radius: 12px;
  overflow: hidden;
}
.screen-preview img { width: 100%; image-rendering: pixelated; }
.screen-fields { display: grid; gap: 12px; align-content: start; }
label { display: grid; gap: 5px; font-size: 14px; }
input, textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #adbcc0;
  border-radius: 7px;
  padding: 8px 10px;
  background: #fff;
  color: #202830;
}
.screen-hint, .screen-error { margin: 0; font-size: 13px; }
.screen-hint { color: #405058; }
.screen-error { color: #952626; }
.screen-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
</style>
