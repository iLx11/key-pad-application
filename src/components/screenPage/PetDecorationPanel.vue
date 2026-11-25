<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { defaultHutchPosition, hutchBounds, isHutchPosition } from '../../utils/petCatalog'
import PetDisplay from './PetDisplay.vue'
import type { HutchPosition, PetState } from './petDisplay'

const props = defineProps<{ state: PetState; connected: boolean; generation: number; busy: boolean }>()
const emit = defineEmits<{ enter: []; move: [position: HutchPosition]; rest: []; inspect: [] }>()
const supported = computed(() => !props.connected || props.generation >= 4)
const canEdit = computed(() => supported.value && props.state.scene === 1 && !props.busy)
const position = computed(() => props.state.hutchPosition ?? defaultHutchPosition)
const x = ref<number | string>(position.value.x)
const y = ref<number | string>(position.value.y)
watch([() => position.value.x, () => position.value.y], ([nextX, nextY]) => {
  x.value = nextX
  y.value = nextY
})
const valid = computed(() => typeof x.value === 'number' && typeof y.value === 'number' && isHutchPosition(x.value, y.value))
const dirty = computed(() => x.value !== position.value.x || y.value !== position.value.y)
function save() {
  if (canEdit.value && valid.value && dirty.value) emit('move', { x: Number(x.value), y: Number(y.value) })
}
</script>

<template>
  <div class="decoration-panel">
    <PetDisplay :state="state" :connected="connected && state.active" :editable-decoration="supported && state.scene === 1" :decoration-busy="busy"
      @move-hutch="p => emit('move', p)" />
    <section aria-label="兔窝装饰设置">
      <h3>宝宝房 · 兔窝</h3>
      <p>兔子困了会回这里睡觉。</p>
      <p v-if="!supported">升级键盘固件后可移动兔窝，并在房间里同时摆放玩具。</p>
      <template v-else-if="state.scene !== 1">
        <p>进入宝宝房即可布置兔窝。</p>
        <button type="button" :disabled="busy" @click="emit('enter')">进入宝宝房</button>
      </template>
      <template v-else>
        <p>拖动兔窝，松开即可保存位置。</p>
        <div class="coordinates">
          <label>横坐标<input v-model.number="x" type="number" :min="hutchBounds.minX" :max="hutchBounds.maxX"
            step="1" :disabled="busy" @keydown.enter.prevent="save"></label>
          <label>纵坐标<input v-model.number="y" type="number" :min="hutchBounds.minY" :max="hutchBounds.maxY"
            step="1" :disabled="busy" @keydown.enter.prevent="save"></label>
        </div>
        <small v-if="!valid">横坐标 {{ hutchBounds.minX }}–{{ hutchBounds.maxX }}，纵坐标 {{ hutchBounds.minY }}–{{ hutchBounds.maxY }}。</small>
        <div class="decor-actions">
          <button type="button" :disabled="!canEdit || !dirty || !valid" @click="save">保存位置</button>
          <button type="button" :disabled="busy || (position.x === defaultHutchPosition.x && position.y === defaultHutchPosition.y)"
            @click="emit('move', { ...defaultHutchPosition })">恢复默认</button>
          <button type="button" :disabled="busy || !!state.fruit" @click="emit('rest')">去兔窝小憩</button>
        </div>
        <h3 v-if="!connected || generation >= 7">玩具桌</h3>
        <button v-if="!connected || generation >= 7" type="button" :disabled="busy || !!state.fruit || !!state.activeToy"
          @click="emit('inspect')">去桌边看看</button>
        <p v-if="!connected">离线布置会保存在本机。</p>
      </template>
    </section>
  </div>
</template>

<style scoped>
.decoration-panel { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(0,1fr); align-items:start; gap:16px; }
.decoration-panel :deep(canvas) { width:100%; }
h3 { margin:0; font-size:16px; }
p, small { display:block; margin:6px 0 10px; font-size:12px; line-height:1.5; color:#49615f; }
.coordinates { display:flex; gap:8px; }
label { flex:1; min-width:0; font-size:12px; }
input,button { box-sizing:border-box; padding:5px 7px; background:white; border:1px solid #aabbb8; border-radius:6px; color:inherit; font:inherit; }
input { width:100%; display:block; margin:3px 0 8px; }
button { font-size:12px; }
button:enabled { cursor:pointer; }
button:disabled { opacity:.55; }
.decor-actions { display:flex; flex-wrap:wrap; gap:5px; }
@media(max-width:500px) { .decoration-panel { grid-template-columns:1fr; } }
</style>
