<script setup lang="ts">
import { computed } from 'vue'
import { petItems } from '../../utils/petCatalog'

const props = defineProps<{
  selected: number
  bindings?: number[]
  generation: number
  connected: boolean
  busy: boolean
  occupied: boolean
  scene: number
  deployedToys?: readonly number[]
  toyDrop?: number
  foodCount: number
  full: boolean
}>()
const emit = defineEmits<{
  select: [id: number]
  bind: [key: number, id: number]
  use: [id: number]
  play: [wireId: number]
}>()
const selectedItem = computed(() => petItems.find(item => item.itemId === props.selected) ?? petItems[0])
const independentHutch = computed(() => !props.connected || props.generation >= 4)
const groups = computed(() => [
  { title: '零食', entries: petItems.filter(item => item.kind === 'fruit') },
  { title: '玩具', entries: petItems.filter(item => item.kind === 'toy' || (!independentHutch.value && item.kind === 'decoration')) },
  ...(independentHutch.value ? [{ title: '装饰', entries: petItems.filter(item => item.kind === 'decoration') }] : [])
])
const available = computed(() => !props.connected || props.generation >= selectedItem.value.minGeneration)
const placement = computed(() => !props.connected || props.generation >= 3)
const targetScene = computed(() => selectedItem.value.id === 'rabbit_hutch' ? 1 : props.scene)
const deployed = computed(() => props.deployedToys?.[targetScene.value] ?? 0)
const visiting = computed(() => independentHutch.value && selectedItem.value.kind === 'decoration')
const placed = computed(() => !visiting.value && selectedItem.value.kind !== 'fruit' && deployed.value === selectedItem.value.wireId)
const canUse = computed(() => available.value && !props.busy && (placement.value || !props.occupied) &&
  (selectedItem.value.kind !== 'fruit' || props.foodCount < 8))
const useLabel = computed(() => {
  const item = selectedItem.value
  if (item.kind === 'fruit') return '投喂' + item.label
  if (visiting.value) return '去兔窝小憩'
  const room = targetScene.value !== props.scene ? '去宝宝房' : ''
  if (!placement.value) return room + '使用' + item.label
  return room + (placed.value ? '收回' : deployed.value ? '替换为' : '投放') + item.label
})
const boundLabel = (id: number) => petItems.find(item => item.itemId === id)?.label ?? '未绑定'
</script>

<template>
  <div class="inventory">
    <div class="catalog" aria-label="道具列表">
      <section v-for="group in groups" :key="group.title">
        <h3>{{ group.title }}</h3>
        <div class="items">
          <button v-for="item in group.entries" :key="item.itemId" type="button" :aria-pressed="selected === item.itemId"
            @click="emit('select', item.itemId)">
            <span class="item-icon" aria-hidden="true" :style="{ backgroundPositionX: (1 - item.itemId) * 16 + 'px' }"></span>
            {{ item.label }}
          </button>
        </div>
      </section>
    </div>
    <section class="detail">
      <div class="item-heading"><h3>{{ selectedItem.label }}</h3>
        <button type="button" class="use" :disabled="!canUse" @click="emit('use', selectedItem.itemId)">{{ useLabel }}</button>
      </div>
      <p class="description">{{ selectedItem.description }}</p>
      <button v-if="placement && placed && targetScene === scene" type="button" class="repeat"
        :disabled="busy || occupied || (toyDrop ?? 100) < 100" @click="emit('play', selectedItem.wireId)">再玩一次</button>
      <p v-if="selectedItem.kind === 'fruit' && placement" class="capacity">
        场内零食 {{ foodCount }} / 8 <span v-if="full">· 兔子吃饱了，饿了会再吃</span>
      </p>
      <h4>绑定按键</h4>
      <p v-if="!connected">连接键盘后即可设置 K1–K8。</p>
      <p v-else-if="generation < 3">升级键盘固件即可自定义道具按键。</p>
      <p v-else>点选按键绑定当前道具，再点一次解除。</p>
      <div class="keys" role="group" :aria-label="selectedItem.label + '的按键绑定'">
        <button v-for="key in 8" :key="key" type="button" :aria-pressed="bindings?.[key - 1] === selected"
          :disabled="!bindings || !connected || busy" @click="emit('bind', key - 1, bindings?.[key - 1] === selected ? 0 : selected)">
          <b>K{{ key }}</b><span>{{ bindings ? boundLabel(bindings[key - 1]) : '—' }}</span>
        </button>
      </div>
      <p v-if="!available" role="status">使用此道具需要升级键盘固件。</p>
    </section>
  </div>
</template>

<style scoped>
.inventory { display:grid; grid-template-columns:minmax(154px,.8fr) minmax(0,1.35fr); gap:18px; }
h3,h4,p { margin:0; }
.catalog section+section { margin-top:14px; }
.catalog h3,h4 { font-size:13px; margin-bottom:6px; color:#405459; }
.items,.keys { display:grid; gap:5px; }
.items { grid-template-columns:1fr 1fr; }
.items button { display:flex; align-items:center; gap:7px; text-align:left; }
.item-icon { flex:none; width:16px; height:16px; transform:scale(1.28); background:url('../../assets/pet/items.png') no-repeat; image-rendering:pixelated; }
.inventory button { box-sizing:border-box; font:inherit; font-size:13px; padding:6px; color:#304647; background:#fff; border:1px solid #bbc9c6; border-radius:6px; cursor:pointer; }
.inventory button[aria-pressed=true] { color:#224b42; background:#deede7; border-color:#568475; }
.inventory button:disabled { cursor:default; opacity:.58; }
.detail { border-left:1px solid #d8e2df; padding-left:18px; }
.item-heading { display:flex; justify-content:space-between; align-items:center; gap:7px; }
.item-heading h3 { font-size:17px; }
.item-heading .use { background:#345d51; border-color:#345d51; color:#fff; }
.detail p { font-size:12px; line-height:1.5; color:#49615f; }
.detail .description { margin:7px 0 17px; }
.detail .repeat,.detail .capacity { margin:0 0 10px; }
.keys { grid-template-columns:repeat(4,1fr); margin-top:7px; }
.keys button { display:grid; gap:3px; justify-items:center; min-width:0; }
.keys span { font-size:11px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width:100%; }
@media(max-width:500px) { .inventory { grid-template-columns:1fr; } .detail { border:0; padding:0; } .items { grid-template-columns:repeat(4,1fr); } }
</style>
