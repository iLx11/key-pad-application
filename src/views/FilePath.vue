<script setup lang="ts">
import { onMounted, ref } from "vue"
import { genCompStr, toHexStr } from '../utils/strTools'
import { useConfigStore } from '../stores/configStore'

const win = window as any
const configStore = useConfigStore()

const getFilePath = async () => {
  let filePath = await win.myApi.getFilePath()
  if(filePath != undefined)
  filePathStr.value = filePath.filePaths[0]
}

const filePathStr = ref<string>('')

const commit = () => {
  if(filePathStr.value == '') {
    configStore.notice('没有选择路径或路径选择错误')
    return
  }
  let compStr = genCompStr(filePathStr.value)
  if((/error/g).test(compStr)) {
    configStore.notice(compStr)
    return
  }
  let strLen = toHexStr(parseInt(`0x${compStr.substring(0, 2)}`))
  // 31010801150300 03000404050607020404050607000404050607
  // 31010801150300 0B 0202 0733 0001 31 0201 18 0005 1608151631 0201 04 000D 07100C110C1617150417121531 0201 07 0007 08160E17121331 0207 0B0C072E060706 0004 37130709
  let genKeyStr = `31010801150300${strLen}${compStr.substring(2)}000128`
  console.info(genKeyStr)

  configStore.keyConfig[configStore.curEvent] = {
    userKey: filePathStr.value,
    genKey: genKeyStr
  }
  console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="file-path-content">
    <div id="file-text">
      选择文件或应用路径
    </div>
    <div id="key-input-box">
      <div id="file-path-show" @click="getFilePath">
        <span v-if="filePathStr == '' ? false : true">{{ filePathStr}}</span>
        <svg v-if="filePathStr == '' ? true : false" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24"><g fill="none"><path fill="currentColor" d="m15.393 4.054l-.502.557zm3.959 3.563l-.502.557zm2.302 2.537l-.685.305zM3.172 20.828l.53-.53zm17.656 0l-.53-.53zM14 21.25h-4v1.5h4zM2.75 14v-4h-1.5v4zm18.5-.437V14h1.5v-.437zM14.891 4.61l3.959 3.563l1.003-1.115l-3.958-3.563zm7.859 8.952c0-1.689.015-2.758-.41-3.714l-1.371.61c.266.598.281 1.283.281 3.104zm-3.9-5.389c1.353 1.218 1.853 1.688 2.119 2.285l1.37-.61c-.426-.957-1.23-1.66-2.486-2.79zM10.03 2.75c1.582 0 2.179.012 2.71.216l.538-1.4c-.852-.328-1.78-.316-3.248-.316zm5.865.746c-1.086-.977-1.765-1.604-2.617-1.93l-.537 1.4c.532.204.98.592 2.15 1.645zM10 21.25c-1.907 0-3.261-.002-4.29-.14c-1.005-.135-1.585-.389-2.008-.812l-1.06 1.06c.748.75 1.697 1.081 2.869 1.239c1.15.155 2.625.153 4.489.153zM1.25 14c0 1.864-.002 3.338.153 4.489c.158 1.172.49 2.121 1.238 2.87l1.06-1.06c-.422-.424-.676-1.004-.811-2.01c-.138-1.027-.14-2.382-.14-4.289zM14 22.75c1.864 0 3.338.002 4.489-.153c1.172-.158 2.121-.49 2.87-1.238l-1.06-1.06c-.424.422-1.004.676-2.01.811c-1.027.138-2.382.14-4.289.14zM21.25 14c0 1.907-.002 3.262-.14 4.29c-.135 1.005-.389 1.585-.812 2.008l1.06 1.06c.75-.748 1.081-1.697 1.239-2.869c.155-1.15.153-2.625.153-4.489zm-18.5-4c0-1.907.002-3.261.14-4.29c.135-1.005.389-1.585.812-2.008l-1.06-1.06c-.75.748-1.081 1.697-1.239 2.869C1.248 6.661 1.25 8.136 1.25 10zm7.28-8.75c-1.875 0-3.356-.002-4.511.153c-1.177.158-2.129.49-2.878 1.238l1.06 1.06c.424-.422 1.005-.676 2.017-.811c1.033-.138 2.395-.14 4.312-.14z"/><path stroke="currentColor" stroke-width="1.5" d="M13 2.5V5c0 2.357 0 3.536.732 4.268C14.464 10 15.643 10 18 10h4" opacity=".5"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.5 18.5v-5m0 0l-2 1.875m2-1.875l2 1.875" opacity=".5"/></g></svg></div>
      <div id="commit-box" @click="commit">
        确认
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#file-path-content {
  @include global.wh(60%, 40%, 600px, 300px);
  @include global.ab_center;
  z-index: 66;
  // background: rgba($color: #000000, $alpha: 0.3);
  #file-text {
    @include global.wh(100%, 60%);
    @include global.style_common(35px 35px 0 0, rgba($color: #494c54, $alpha: 1));
    color: rgba(255, 255, 255, 1);
    padding: 1.2em;
    font-size: 20px;
  }
  #key-input-box {
    @include global.wh(100%, 70%);
    @include global.style_common(30px 30px 12px 12px, rgba(255, 255, 255, 1));
    @include global.pos_ab(0, 0, 2);
    @include global.flex_center;
    overflow: hidden;
    #file-path-show {
      @include global.wh(80%, 50%);
      font-size: 35px;
      word-break: break-all;
      cursor: pointer;
      @include global.flex_config(1, space-around);
      color: rgba(119, 119, 119, 0.8);
      span {
        width: 100%;
        // height: 30px;
        @include global.font_config(24px !important, rgba(73, 76, 84, 0.8));
      }
    }
    #commit-box {
      @include global.wh(120px, 50px);
      @include global.pos_ab(20px, 20px, 2);
      cursor: pointer;
      @include global.style_common(12px, rgba(210, 168, 169, 0.8));
      @include global.flex_center;
      @include global.font_config(20px, rgba(255, 255, 255, 1));
    }
  }
}
</style>
