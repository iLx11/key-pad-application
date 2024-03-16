<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { toHexStr } from '../utils/strTools'

const configStore = useConfigStore()

const mouseArray = reactive([
  {
    eventId: 0,
    eventName: '左键点击',
    isSelect: false
  },
  {
    eventId: 1,
    eventName: '中键点击',
    isSelect: false
  },
  {
    eventId: 2,
    eventName: '右键点击',
    isSelect: false
  }
])

const mouseMove = reactive({
  mouseUp: '',
  mouseDown: '',
  mouseLeft: '',
  mouseRight: ''
})

const rollMove = reactive({
  rollUp: '',
  rollDown: ''
})
watch(
  () => rollMove.rollUp,
  () => {
    rollMove.rollDown = '0'
    let reg = new RegExp(/^\d+$/)
    if (!reg.test(rollMove.rollUp)) {
      configStore.notice('请输入纯数字')
      rollMove.rollUp = '0'
    }
    if(Number(rollMove.rollUp) > 255) {
      configStore.notice('偏移数值不能超过 255')
      rollMove.rollUp = '0'
    }
  }
)
watch(
  () => rollMove.rollDown,
  () => {
    rollMove.rollUp = '0'
    let reg = new RegExp(/^\d+$/)
    if (!reg.test(rollMove.rollDown)) {
      configStore.notice('请输入纯数字')
      rollMove.rollDown = '0'
    }
    if(Number(rollMove.rollDown) > 255) {
      configStore.notice('偏移数值不能超过 255')
      rollMove.rollDown = '0'
    }
  }
)
watch(
  () => mouseMove.mouseUp,
  () => {
    mouseMove.mouseDown = '0'
    let reg = new RegExp(/^\d+$/)
    if (!reg.test(mouseMove.mouseUp)) {
      configStore.notice('请输入纯数字')
      mouseMove.mouseUp = '0'
    }
    if(Number(mouseMove.mouseUp) > 255) {
      configStore.notice('偏移数值不能超过 255')
      mouseMove.mouseUp = '0'
    }
  }
)
watch(
  () => mouseMove.mouseDown,
  () => {
    mouseMove.mouseUp = '0'
    let reg = new RegExp(/^\d+$/)
    if (!reg.test(mouseMove.mouseDown)) {
      configStore.notice('请输入纯数字')
      mouseMove.mouseDown = '0'
    }
    if(Number(mouseMove.mouseDown) > 255) {
      configStore.notice('偏移数值不能超过 255')
      mouseMove.mouseDown = '0'
    }
  }
)
watch(
  () => mouseMove.mouseLeft,
  () => {
    mouseMove.mouseRight = '0'
    let reg = new RegExp(/^\d+$/)
    if (!reg.test(mouseMove.mouseLeft)) {
      configStore.notice('请输入纯数字')
      mouseMove.mouseLeft = '0'
    }
    if(Number(mouseMove.mouseLeft) > 255) {
      configStore.notice('偏移数值不能超过 255')
      mouseMove.mouseLeft = '0'
    }
  }
)
watch(
  () => mouseMove.mouseRight,
  () => {
    mouseMove.mouseLeft = '0'
    let reg = new RegExp(/^\d+$/)
    if (!reg.test(mouseMove.mouseRight)) {
      configStore.notice('请输入纯数字')
      mouseMove.mouseRight = '0'
    }
    if(Number(mouseMove.mouseRight) > 255) {
      configStore.notice('偏移数值不能超过 255')
      mouseMove.mouseRight = '0'
    }
  }
)

const mouseKeyArray = [0x01, 0x04, 0x02,]

const commit = () => {
  let genKeyStr: string = ''
  let userKeyStr: string = ''
  let mouseKey: number = 0x00
  mouseArray.forEach(o => {
    if(o.isSelect)  {
      mouseKey += mouseKeyArray[o.eventId]
      userKeyStr += `${o.eventName}\r\n `
    }
  })
  genKeyStr = `4${toHexStr(mouseKey)}`
  if(mouseMove.mouseRight != '0') {
    genKeyStr += `1${toHexStr(Number(mouseMove.mouseRight))}`
    userKeyStr += `向右移动 -> ${mouseMove.mouseRight}\r\n`
  } else {
    genKeyStr += `0${toHexStr(Number(mouseMove.mouseLeft))}`
    userKeyStr += `向左移动 -> ${mouseMove.mouseLeft}\r\n`
  }
  if(mouseMove.mouseUp != '0') {
    genKeyStr += `0${toHexStr(Number(mouseMove.mouseUp))}`
    userKeyStr += `向上移动 -> ${mouseMove.mouseUp}\r\n`
  } else {
    genKeyStr += `1${toHexStr(Number(mouseMove.mouseDown))}`
    userKeyStr += `向下移动 -> ${mouseMove.mouseDown}\r\n`
  }
  if(rollMove.rollUp != '0') {
    genKeyStr += `1${toHexStr(Number(rollMove.rollUp))}`
    userKeyStr += `向上滚动 -> ${rollMove.rollUp}\r\n`
  } else {
    genKeyStr += `0${toHexStr(Number(rollMove.rollDown))}`
    userKeyStr += `向下上滚动 -> ${rollMove.rollUp}\r\n`
  }
  // console.info(genKeyStr)
  configStore.keyConfig[configStore.curEvent] = {
    userKey: userKeyStr,
    genKey: genKeyStr
  }
  console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="mouse-func-content">
    <div class="div1"></div>
    <div class="div2">
      <input type="text" placeholder="左" v-model="mouseMove.mouseLeft" />
    </div>
    <div class="div3">
      <input type="text" placeholder="右" v-model="mouseMove.mouseRight" />
    </div>
    <div class="div4">
      <input type="text" placeholder="下" v-model="mouseMove.mouseDown" />
    </div>
    <div class="div5">
      <input type="text" placeholder="上" v-model="mouseMove.mouseUp" />
    </div>
    <div class="div6" :class="{isSelect: mouseArray[0].isSelect}" @click="mouseArray[0].isSelect = !mouseArray[0].isSelect">{{ mouseArray[0].eventName }}</div>
    <div class="div7">
      <input type="text" placeholder="向上滚动" v-model="rollMove.rollUp"/>
      <span :class="{isSelect: mouseArray[1].isSelect}" @click="mouseArray[1].isSelect = !mouseArray[1].isSelect">{{ mouseArray[1].eventName }}</span>
      <input type="text" placeholder="向下滚动" v-model="rollMove.rollDown" />
    </div>
    <div class="div8" :class="{isSelect: mouseArray[2].isSelect}" @click="mouseArray[2].isSelect = !mouseArray[2].isSelect">{{ mouseArray[2].eventName }}</div>
    <div class="div9" @click="commit">确认</div>
    <!-- <div id="commit-box">确认</div> -->
  </div>
</template>

<style lang="scss" scoped>
.isSelect {
  background:rgba($color: #494c54, $alpha: 1) !important;
  color: rgb(219, 141, 141) !important;
  border: 2px solid rgba(217, 224, 226, 1);
}
#mouse-func-content {
  width: 600px;
  height: 600px;
  max-width: 600px;
  max-height: 600px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  background: rgba(255, 255, 255, 1);
  border-radius: 50%;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  grid-column-gap: 15px;
  grid-row-gap: 16px;
  padding: 25px;
  color: rgba(255, 255, 255, 1);
  font-size: 1.4em;
  div {
    border-radius: 39px;
    background: rgba($color: #494c54, $alpha: 1);
    cursor: pointer;
  }
  input {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0);
    outline: none;
    border: none;
    text-align: center;
    font-size: 35px;
    color: rgba(255, 255, 255, 1);
  }
  .div1 {
    grid-area: 2 / 2 / 8 / 8;
    background: rgba(255, 255, 255, 1);
    border-radius: 50%;
    box-shadow: 0 0 0 2px #494c54;
  }
  .div2 {
    grid-area: 4 / 1 / 6 / 3;
  }
  .div3 {
    grid-area: 4 / 7 / 6 / 9;
  }
  .div4 {
    grid-area: 7 / 4 / 9 / 6;
  }
  .div5 {
    grid-area: 1 / 4 / 3 / 6;
  }
  .div6 {
    grid-area: 3 / 3 / 5 / 4;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .div7 {
    grid-area: 3 / 4 / 6 / 6;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    border: 1.5px solid #494c54;
    background:  rgba(255, 255, 255, 1);
    input {
      width: 100%;
      height: 30%;
      background: rgba(255, 255, 255, 1);
      outline: none;
      text-align: center;
      font-size: 18px;
      color: rgba(51, 51, 51, 1);
    }
    span {
      width: 100%;
      height: 30%;
      background: rgba($color: #494c54, $alpha: 1);
      color: rgba(255, 255, 255, 1);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .div8 {
    grid-area: 3 / 6 / 5 / 7;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .div9 {
    grid-area: 6 / 4 / 7 / 6;
    background: rgba(210, 168, 169, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: rgba(255, 255, 255, 1);
    cursor: pointer;
  }
}
</style>
