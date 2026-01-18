<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { getStringMap } from '../utils/hidKeyCode'
import { toHexStr } from '../utils/strTools'
import {XBox} from '@/utils/xBox/xBox.js'

const configStore = useConfigStore()

const textCount = ref<number>(0)
const textValue = ref<string>('')

const COUNT_VALUE = 100

// 文本字数限制
watch(
  () => textValue.value,
  () => {
    textCount.value = textValue.value.length
    if (textCount.value > COUNT_VALUE) textValue.value = textValue.value.substring(0, 255)
  }
)
// 提交
const commit = () => {
  if (textValue.value == '') {
    XBox.popMes('没有输入任何内容')
    return
  }
  let genKeyStr: string = ''
  let state: number = 0
  let tempStr: string = ''
  let keyCount: number = 0

  try {
    for (let i = 0; i < textValue.value.length; i++) {
      // 特殊键值
      if (!/\r|\n/.test(textValue.value[i])) {
        if (/[A-Z]/.test(textValue.value[i]) || getStringMap().get(textValue.value[i]).kind > 1) {
          if (state != 3 && state != 0) {
            genKeyStr += `00${toHexStr(tempStr.length / 2)}${tempStr}`
            tempStr = ''
            keyCount++
          }
          state = 3
          tempStr += getStringMap().get(textValue.value[i]).hex
          continue
        }
      }
      // 普通键值
      if (state != 2 && state != 0) {
        genKeyStr += `02${toHexStr(tempStr.length / 2)}${tempStr}`
        tempStr = ''
        keyCount++
      }
      state = 2
      if (/\r|\n/.test(textValue.value[i])) {
        tempStr += getStringMap().get('Enter').hex
        continue
      }
      tempStr += getStringMap().get(textValue.value[i]).hex
    }
    if (state == 2) {
      genKeyStr += `00${toHexStr(tempStr.length / 2)}${tempStr}`
    }
    if (state == 3) {
      genKeyStr += `02${toHexStr(tempStr.length / 2)}${tempStr}`
    }
    genKeyStr = `1${toHexStr(++keyCount)}${genKeyStr}`
  } catch (error) {
    XBox.popMes('有错误产生，可能有不支持的字符')
    return
  }
  console.info(genKeyStr)
  configStore.keyConfig[configStore.curEvent] = {
    userKey: textValue.value,
    genKey: genKeyStr
  }
  console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="send-text-content">
    <textarea name="" id="" cols="30" rows="10" v-model="textValue" spellcheck="false"></textarea>
    <div id="commit-box" @click="commit">确认</div>
    <div id="text-limit">
      <span>{{ textCount }} </span
      > / 100
    </div>
  </div>
</template>

<style lang="scss" scoped>
#send-text-content {
  @include global.wh(60%, 35%, 600px, 350px);
  @include global.ab_center;
  z-index: 66;
  // background: rgba($color: #000000, $alpha: 0.3);
  overflow: hidden;
  @include global.style_common(16px, rgba(255, 255, 255, 1));
  padding: 3.5em;

  textarea {
    @include global.full_wh;
    font-size: 20px;
    outline: none;
    border: none;
    background: rgba(255, 255, 255, 0);
    resize: none;
  }
  #commit-box {
    @include global.wh(120px, 50px);
    @include global.pos_ab(20px, 20px, 2);
    @include global.style_common(12px, rgba(210, 168, 169, 0.8));
    cursor: pointer;
    @include global.flex_center;
    @include global.font_config(20px, rgba(255, 255, 255, 1));
  }
  #text-limit {
    @include global.wh(120px, 50px);
    @include global.pos_ab(6px, 20px, 1);
    border-radius: 12px;
    @include global.flex_center;
    font-size: 20px;
  }
}
</style>
