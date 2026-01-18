<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import packageJson from '../../../package.json'
import { getLatestVersion } from '../../api/version'
// import goodImg from '../../../img/good.jpg'
import {XBox} from '@/utils/xBox/xBox.js'


const win = window as any

const curVersion = ref<string>('')
const latestVersion = ref<string>('检查版本更新')

let preTime: number

onMounted(async () => {
  // win.myApi.delItem('pretime')
  curVersion.value = packageJson.version
  const time = await win.myApi.getMenu('pretime')
  if (!time || time == undefined) {
    win.myApi.storageMenu('pretime', '0')
    preTime = 0
  } else {
    preTime = Number(time)
  }
  if(typeof preTime != 'number' || isNaN(preTime)) {
    win.myApi.storageMenu('pretime', '0')
  }
  console.info(preTime)
})

const getLatest = async () => {
  let curTime = new Date().getTime()
  if (Number(curTime) - Number(preTime) > (30 * 1000)) {
    preTime = Number(curTime)
    win.myApi.storageMenu('pretime', String(curTime))
    // console.info(preTime)
    // 获取最新版本信息
    const data = await getLatestVersion()
    if (!data) {
      XBox.popMes('获取版本出错！')
      return
    }
    if (data.latestVerison == curVersion.value) {
      XBox.popMes('版本已经是最新！')
    } else {
      XBox.popMes('有最新版软件，即将跳转下载')
      win.myApi.latestDownload(data.downloadLink)
    }
  } else {
    XBox.popMes('接口资源有限，请在 30 秒后尝试 ~')
  }
}

const scrollToBottom = () => {
  const box = document.querySelector('#app-info-box')
  box.scrollTo(0, 300)
}
</script>

<template>
  <div id="app-info-box">
    <div id="info-centent">
      <span>{{ curVersion }}</span>
      <div>Version</div>
      <div id="check-version" @click.stop="getLatest">{{ latestVersion }}</div>
      <div id="good-text" @click="scrollToBottom">如果觉得软件做的不错，并且觉得可以支持一下的朋友可以扫下面的赞赏码，同时还请留下您的备注，非常感谢！</div>
      <img src="../../../public/img/good.jpg" id="good-img" @click="scrollToBottom" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#app-info-box {
  @include global.wh(60%, 80%);
  @include global.ab_center;
  left: 47%;
  @include global.style_common(25px, rgba(255, 255, 255, 1));
  @include global.flex_config(1, flex-start);
  padding: 3em;
  overflow-y: scroll;
  @include global.font_config(18px, rgba(51, 51, 51, 0.8));
  user-select: none;
  #info-centent {
    @include global.wh(100%, auto);
    @include global.flex_config(1, flex-start);
  }
  span {
    @include global.font_config(50px, rgba(51, 51, 51, 0.6));
  }
  #check-version {
    @include global.wh(200px, 50px);
    margin-top: 1em;
    @include global.style_common(25px, rgba(145, 208, 156, 0.4), null, global.$shadow1);
    @include global.flex_center;
    cursor: pointer;
  }
  #good-text {
    margin-top: 68px;
    @include global.font_config(14px, rgba(51, 51, 51, 0.6));
    text-align: center;
    cursor: pointer;
  }
  img {
    width: 70%;
    margin-top: 24px;
    cursor: pointer;
  }
}
</style>
