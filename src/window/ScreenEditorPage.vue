<script setup lang="ts">
import WindowTitle from '../components/tools/WindowTitle.vue'
import PopBox from '../components/tools/PopBox.vue'
import ScreenEditor from '../components/screenPage/screenEditor.vue'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const win = window as any
const configStore = useConfigStore()
const popBoxRef = ref<HTMLElement | null>(null)

onMounted(() => {
  win.myApi.storeChangeListen((objData: object) => {
    console.info('keyConfigPage listening')
    const keys = Object.keys(objData)
    for(let key of keys) {
      // 设置对应 store 的
      configStore[`set${key.replace(key.charAt(0), key.charAt(0).toUpperCase())}`](objData[key])
    }
    console.info(configStore.curScreen)
  })
  // 获取 配置的索引
  win.myApi.setConfigStore({
    get: 'curScreen'
  })
})

</script>

<template>
  <PopBox ref="popBoxRef" />
  <div class="container">
    <WindowTitle>
      <template #title>
        ScreenEditor
      </template>
    </WindowTitle>
    <div id="key-config-content">
      <ScreenEditor />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#cover {
  width: 98%;
  height: 98%;
  @include ab_center;
  @include style_common(15px, rgba(51, 51, 51, 0.2));
  z-index: 998;
}
.container {
  @include full_wh;
  @include ab_center;
  border: 6px solid rgba(15, 16, 23, 1);
  border-radius: 2.5em;
  overflow: hidden;
  box-sizing: border-box;
  padding: 10px;
  z-index: 2;
  color: var(--text-color-1);
  // padding-bottom: 12px;
  background-color: #d9c6c6;
  background-image: linear-gradient(135deg, #d9c6c6 0%, #c9e0e5 87%, #cfdcdd 100%);
  padding-bottom: 4em;
  position: relative;
}
#key-config-content {
  @include full_wh;
  max-width: 950px;
  max-height: 750px;
  margin: 0 auto;
  border-radius: 25px;
  overflow: hidden;
  > div {
    @include style_common(9px, rgba(114, 106, 109, 0.2));
  } 
}
</style>
