<script setup lang="ts">
import WindowTitle from '../components/tools/WindowTitle.vue'
import PopBox from '../components/tools/PopBox.vue'
import ConfigData from '../components/configPage/ConfigData.vue'
import EventBox from '../components/configPage/EventBox.vue'
import FuncBox from '../components/configPage/FuncBox.vue'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { useRouter } from 'vue-router'

const win = window as any
const router = useRouter()
const configStore = useConfigStore()
const funcShow = ref<boolean>(false)
const popBoxRef = ref<HTMLElement | null>(null)

onMounted(() => {
  win.myApi.storeChangeListen((objData: object) => {
    console.info('keyConfigPage listening')
    const keys = Object.keys(objData)
    // 复制单键配置
    if (keys[0] == 'keyConfig') {
      let tempArr = JSON.parse(objData[keys[0]])
      for (let i = 0; i < 6; i++) {
        configStore.setCurEvent(i)
        let temp = {
          userKey: tempArr[i].userKey,
          genKey: tempArr[i].genKey
        }
        configStore.setKeyConfig(JSON.stringify(temp))
      }
      configStore.setCurEvent(0)
      return
    }
    for (let key of keys) {
      // 设置对应 store 的
      configStore[`set${key.replace(key.charAt(0), key.charAt(0).toUpperCase())}`](objData[key])
    }
  })
  // 获取 配置的索引
  win.myApi.setConfigStore({
    get: 'configIndex'
  })
  win.myApi.setConfigStore({
    get: 'keyConfig'
  })
})

const closeFuncBox = () => {
  configStore.setFuncShow(false)
}
watch(
  () => configStore.funcShow,
  () => {
    if (configStore.funcShow == true) {
      funcShow.value = true
    } else {
      funcShow.value = false
      router.push(`/config`)
    }
  }
)

</script>

<template>
  <PopBox ref="popBoxRef" />
  <div class="container">
    <WindowTitle>
      <template #title> KeyConfig </template>
    </WindowTitle>
    <div id="key-config-content">
      <div class="div1">
        <ConfigData />
      </div>
      <div class="div2">
        <EventBox />
      </div>
      <div class="div3">
        <FuncBox />
      </div>
    </div>
    <div id="func-position" v-if="funcShow" @click.stop="closeFuncBox">
      <router-view @click.stop=""></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#cover {
  @include wh(98%, 98%);
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
  border-radius: 19px;
  overflow: hidden;
  @include grid_config(5, 6, 15px, 16px);
  > div {
    @include style_common(9px, rgba(114, 106, 109, 0.2));
  }
  .div1 {
    grid-area: 1 / 1 / 4 / 4;
    padding: 15px;
  }
  .div2 {
    grid-area: 4 / 1 / 7 / 4;
    padding: 12px;
    div {
      @include full_wh;
      // background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
    }
  }
  .div3 {
    grid-area: 1 / 4 / 7 / 6;
    padding: 12px;
  }
}
#func-position {
  @include full_wh;
  @include pos_ab;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  @include style_common(10px, rgba(158, 170, 172, 0.3), 1px solid rgba(255, 255, 255, 0.18));
  z-index: 88;
}
</style>
