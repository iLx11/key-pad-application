<script setup lang="ts">
import WindowTools from '../components/tools/WindowTools.vue'
import WindowTitle from '../components/tools/WindowTitle.vue'
import { onMounted, nextTick, ref, watch, reactive } from 'vue'
import PopBox from '../components/tools/PopBox.vue'
import ProgressBox from '../components/homePage/ProgressBox.vue'
import { useRouter } from 'vue-router'
import { getStringMap } from '../utils/hidKeyCode'
import { useConfigStore } from '../stores/configStore'

const router = useRouter()
const win = window as any
const configStore = useConfigStore()
const popBoxRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  // 连接硬件
  await testConnection()
  // 主页面监听
  win.myApi.storeChangeListen((objData: object) => {
    // console.info('homePage listening', objData)
    // 有 get 属性
    if (objData.get) {
      let storeValue = objData.get
      let tempObj: object = {}
      tempObj[storeValue] = configStore[storeValue]
      // 发送其他窗口同步
      win.myApi.setConfigStore(tempObj)
      return
    }
    try {
      // 同步信息
      const keys = Object.keys(objData)
      for (let key of keys) {
        // 设置对应 store 的值
        configStore[`set${key.replace(key.charAt(0), key.charAt(0).toUpperCase())}`](objData[key])
      }
    } catch (error) {
      console.error(error)
      configStore.notice('同步信息错误')
    }
  })
})
// 测试连接
const testConnection = async () => {
  let conStore = await win.myApi.connectHardware()
  console.info(conStore)
  if (conStore === 0) {
    configStore.notice('连接成功')
    conState.value = true
    return
  } else {
    configStore.notice('连接失败，请检查硬件连接')
    conState.value = false
  }
}

// 打开键值编辑窗口
const openConfigWindow = async (index: number) => {
  configStore.setConfigIndex(index)
  console.log(configStore.configIndex)
  createWindow()
  // await new Promise(resolve => setTimeout(resolve, 1000));
}

const createWindow = () => {
  // console.log(router)
  // console.log(router.currentRoute.value.path)
  win.myApi.createNewWindow(
    {
      route: '/config'
    },
    {
      width: 900,
      height: 700,
      minWidth: 800,
      minHeight: 630
    }
  )
}

// 连接状态
const conState = ref<boolean>(false)
const stateMes = reactive([
  {
    text: '未连接',
    bgStyle: 'rgba(51, 51, 51, 0.2)'
  },
  {
    text: '已连接',
    bgStyle: 'rgba(171, 242, 187, 0.3)'
  }
])

const titleClick = async () => {
  await testConnection()
}

watch(
  () => configStore.isTextShow,
  () => {
    if (configStore.isTextShow == true) {
      configStore.setIsTextShow(false)
      popBoxRef.value['showPop'](configStore.noticeText)
    }
  },
  {
    immediate: true,
    deep: true
  }
)

// 同步一层配置的功能
watch(
  () => configStore.keyConfig,
  () => {
    configStore.setLayerKeyConfig(JSON.stringify(configStore.keyConfig))
    console.info('layerKeyConfig', configStore.layerKeyConfig)
  },
  {
    deep: true
  }
)

const progressShow = ref<boolean>(false)
const sendConfigData = async () => {
  // 测试连接
  await testConnection()
  if (conState.value == false) {
    configStore.notice('硬件未连接')
    // return
  }
  // 显示过程页面，发送到硬件
  progressShow.value = true
  // 开始拼接数据并发送
  configStore.setProgressMes(0)
  let tempObj = {}
  let beginIndex = 0
  configStore.layerKeyConfig.forEach((o, i) => {
    if (o.length != 0) {
      o.forEach((x, j) => {
        if (x.genKey != '') tempObj[`${beginIndex > 9 ? beginIndex : '0' + beginIndex}`] = x.genKey
        if (i < 8 && j < 2) beginIndex++
        if (i > 7) beginIndex++
      })
    } else {
      if (i < 8) beginIndex += 2
      else beginIndex += 6
    }
  })
  let dataStr = JSON.stringify(tempObj)
  console.info('tempObj', dataStr)
  let left = 0,
    right = 60
  while (right < dataStr.length) {
    // win.myApi.sendData(dataStr.substring(left, right))
    console.info(dataStr.substring(left, right))
    left = right
    if (dataStr.length - 1 - right < 60) {
      right = dataStr.length
      console.info(dataStr.substring(left, right))
      configStore.setProgressMes((right / dataStr.length) * 100)
      break
    } else right += 60
    configStore.setProgressMes((right / dataStr.length) * 100)
  }
  progressShow.value = false
  configStore.notice('数据传输完成')
}
</script>

<template>
  <PopBox ref="popBoxRef" />
  <div class="container">
    <WindowTitle>
      <template #title>
        <div id="window-title" @click="titleClick">
          <div>MultiPad</div>
          <div id="con-state" :style="{ background: conState ? stateMes[1].bgStyle : stateMes[0].bgStyle }">
            {{ conState ? stateMes[1].text : stateMes[0].text }}
            <div id="mes-box">点击连接状态或窗口标题可以手动连接</div>
          </div>
        </div>
      </template>
    </WindowTitle>
    <div id="home-cotent">
      <div class="div1">
        <div @click.stop="openConfigWindow(8)"></div>
        <div @click.stop="openConfigWindow(9)"></div>
      </div>
      <div class="div2">
        <div class="div5">
          <div></div>
        </div>
        <div class="div6">
          <div></div>
        </div>
        <div class="div7">
          <div></div>
        </div>
        <div class="div8">
          <div @click="sendConfigData">发送</div>
        </div>
      </div>
      <div class="div3">
        <div>
          <div @click.stop="openConfigWindow(0)"></div>
          <div @click.stop="openConfigWindow(1)"></div>
          <div @click.stop="openConfigWindow(2)"></div>
          <div @click.stop="openConfigWindow(3)"></div>
          <div @click.stop="openConfigWindow(4)"></div>
          <div @click.stop="openConfigWindow(5)"></div>
          <div @click.stop="openConfigWindow(6)"></div>
          <div @click.stop="openConfigWindow(7)"></div>
        </div>
      </div>
      <div class="div4" @click.stop="openConfigWindow(10)"></div>
    </div>
    <ProgressBox v-if="progressShow" />
  </div>
</template>

<style lang="scss">
#window-title {
  width: 30%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  // align-items: center;
  -webkit-app-region: drag;
  font-size: 20px;
  -webkit-app-region: no-drag !important;
  cursor: pointer;
}
#con-state {
  width: 80px;
  height: 30px;
  word-break: keep-all;
  background: rgba(51, 51, 51, 0.2);
  // background: rgba(171, 242, 187, 0.3);

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 17px;
  border-radius: 12px;
  position: relative;
  #mes-box {
    width: 150px;
    height: 70px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -84px;
    background: rgba(103, 109, 115, 1);
    padding: 10px;
    word-break: break-all;
    display: none;
    border-radius: 9px;
  }
  #mes-box::after {
    content: '';
    width: 30px;
    height: 10px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: -10px;
    background: rgba(103, 109, 115, 1);
    clip-path: polygon(0 100%, 50% 0, 100% 100%, 0 100%);
  }
}
#con-state:hover {
  #mes-box {
    display: block;
  }
}

#cover {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(51, 51, 51, 0.2);
  border-radius: 15px;
  z-index: 998;
}

.container {
  width: 95%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-52%, -50%);
  border: 10px solid rgba(15, 16, 23, 1);
  border-radius: 4em;
  // overflow: hidden;
  box-sizing: border-box;
  padding: 10px;
  z-index: 2;
  color: var(--text-color-1);
  padding-bottom: 12px;
  background-color: #e5eae9;
  background-image: linear-gradient(20deg, #e5eae9 0%, #8f9d9f 100%);

  // -webkit-app-region: drag;
}

#home-cotent {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  // background: rgba($color: #000000, $alpha: 1.0);
  // position: absolute;
}
.div1 {
  grid-area: 1 / 1 / 3 / 2;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
  div {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    background: rgba(12, 14, 20, 1);
    cursor: pointer;
  }
}
.div2 {
  grid-area: 1 / 2 / 3 / 8;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  padding-bottom: 20px;
  padding-left: 10px;
  div {
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
  }
  .div5 {
    grid-area: 1 / 1 / 4 / 4;
    div {
      width: 200px;
      height: 108px;
      margin: 10px auto;
    }
  }
  .div6 {
    grid-area: 1 / 4 / 3 / 6;
    div {
      width: 120px;
      height: 66px;
      margin: 10px auto;
    }
  }
  .div7 {
    grid-area: 1 / 6 / 3 / 8;
    div {
      width: 120px;
      height: 66px;
      margin: 10px auto;
    }
  }
  .div8 {
    grid-area: 3 / 4 / 4 / 8;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 5px;
    color: rgba(255, 255, 255, 1);
    div {
      width: 90px;
      height: 100%;
      background: rgba(191, 205, 211, 0.909);
      border-radius: 2px;
      word-break: keep-all;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 15px;
    }
  }
}
.div3 {
  grid-area: 3 / 1 / 6 / 6;
  // background: rgba($color: #000000, $alpha: 0.4);
  margin-bottom: 20px;

  > div {
    width: 100%;
    height: 210px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 15px;
    grid-row-gap: 15px;
    // background: rgba($color: #000000, $alpha: 0.4);
    background-color: #cfaaac;
    background-image: linear-gradient(62deg, #cfaaac 0%, #a9b7c0 100%);
    border-radius: 12px;
    div {
      cursor: pointer;
      border-radius: 12px;
      background: rgba($color: #000000, $alpha: 0.4);
    }
  }
}
.div4 {
  grid-area: 3 / 6 / 6 / 8;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background: rgba(12, 14, 20, 1);
  position: fixed;
  right: -40px;
  bottom: 20px;
  cursor: pointer;
}
</style>
