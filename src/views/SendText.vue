<script setup lang="ts">
import { start } from 'repl'
import { ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { getStringMap } from '../utils/hidKeyCode'
import { toHexStr } from '../utils/strTools'

const configStore = useConfigStore()

const textCount = ref<number>(0)
const textValue = ref<string>('')

// 文本字数限制
watch(
  () => textValue.value,
  () => {
    textCount.value = textValue.value.length
    if (textCount.value > 255) textValue.value = textValue.value.substring(0, 255)
  }
)

const commit = () => {
  if (textValue.value == '') return
  let genkeyStr: string = ''
  let state = 2
  for (let i = 0; i < textValue.value.length; i ++) {
    if(/[A-Z]/.test(textValue.value[i])) {
      if(state != 3) {
        genkeyStr += 'aaa'
      }
      state = 3
      genkeyStr += getStringMap().get(textValue.value[i]).hex
      continue
    }
    if(state != 0) {
      genkeyStr += '00'
    }
    state = 0
    if(/\r|\n/.test(textValue.value[i])) {
      genkeyStr += getStringMap().get('Enter').hex
      continue
    }
    genkeyStr += getStringMap().get(textValue.value[i]).hex
  }
  // try {
  //   // 处理键值索引
  //   for(let j of tempArr) {
  //     for(let i of j) {
  //       genkeyStr += getStringMap().get(i).hex
  //     }
  //     genkeyStr += getStringMap().get('Enter').hex
  //   }
  // } catch (error) {
  //   configStore.notice("有错误产生，可能有不支持的字符")
  //   return
  // }

  console.info(genkeyStr)
  // configStore.setFuncShow(false)
  // console.info(configStore.keyConfig[configStore.curEvent])
  // configStore.keyConfig[configStore.curEvent] = {
  //   userKey: userKeyStr,
  //   genKey: genKeyStr
  // }
}
</script>

<template>
  <div id="send-text-content">
    <textarea name="" id="" cols="30" rows="10" v-model="textValue" spellcheck="false"></textarea>
    <div id="commit-box" @click="commit">确认</div>
    <div id="text-limit">
      <span>{{ textCount }}</span
      >/255
    </div>
  </div>
</template>

<style lang="scss" scoped>
#send-text-content {
  width: 60%;
  height: 35%;
  max-width: 600px;
  max-height: 350px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  // background: rgba($color: #000000, $alpha: 0.3);
  background: rgba(255, 255, 255, 1);
  overflow: hidden;
  border-radius: 16px;
  padding: 3.5em;

  textarea {
    width: 100%;
    height: 100%;
    font-size: 20px;
    outline: none;
    border: none;
    background: rgba(255, 255, 255, 0);
    resize: none;
  }
  #commit-box {
    width: 120px;
    height: 50px;
    background: rgba(210, 168, 169, 0.8);
    position: absolute;
    right: 20px;
    bottom: 20px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: rgba(255, 255, 255, 1);
  }
  #text-limit {
    width: 120px;
    height: 50px;
    position: absolute;
    right: 20px;
    top: 6px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
  }
}
</style>
