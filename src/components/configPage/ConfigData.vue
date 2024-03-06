<script setup lang="ts">
import { watch, ref } from 'vue';
import { useConfigStore } from '../../stores/configStore'

const configStore = useConfigStore()

const configStr = ref<string>('ConfigData')

watch(() => configStore.curEvent, () => {
  // console.info(configStore.keyConfig[configStore.curEvent])
  configStr.value = configStore.keyConfig[configStore.curEvent].userKey && configStore.keyConfig[configStore.curEvent].userKey
})
watch(() => configStore.keyConfig, () => {
  // console.info(configStore.keyConfig[configStore.curEvent])
  configStr.value = configStore.keyConfig[configStore.curEvent].userKey
  // 发送到主页面进行同步
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