<script setup lang="ts">
import { watch, ref } from 'vue';
import { useConfigStore } from '../../stores/configStore'

const win = window as any
const configStore = useConfigStore()
const configStr = ref<string>('ConfigData')

// 切换不同事件
watch(() => configStore.curEvent, () => {
  // console.info(configStore.keyConfig[configStore.curEvent])
  configStr.value = configStore.keyConfig[configStore.curEvent].userKey && configStore.keyConfig[configStore.curEvent].userKey
})

// 同步编辑的功能
watch(() => configStore.keyConfig, () => {
  // console.info(configStore.keyConfig[configStore.curEvent])
  configStr.value = configStore.keyConfig[configStore.curEvent].userKey
}, {
  deep: true
})
</script>

<template>
  <div id="config-data-content">
    <div>
      {{ configStr }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
#config-data-content {
  width: 100%;
  height: 100%;
  color: rgb(255, 255, 255, 0.9);
  font-size: 33px;
  overflow: hidden;
  padding: 0.5em;
  word-break: break-all;
  div {
    width: 100%;
    height: 100%;
    overflow: scroll;
  }
}
</style>