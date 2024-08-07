<script setup lang="ts">
import WindowTools from '../components/tools/WindowTools.vue'
import WindowTitle from '../components/tools/WindowTitle.vue'
import { onMounted, nextTick, ref, watch, reactive } from 'vue'
import PopBox from '../components/tools/PopBox.vue'
import ProgressBox from '../components/homePage/ProgressBox.vue'
import AppInfo from '../components/homePage/AppInfo.vue'
import ContextMenu from '../views/contextMenu.vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '../stores/configStore'
import { useMenuStore } from '../stores/menuStore'
import { parseMenuConfig, testConnection, sendMenu, sendColorScreen, sendOledScreen, sendConfigData, loadMenu, resetData } from '../utils/dataHandle'
// import { setItem, getItem } from '@/utils/storage'
import {XBox} from '@/utils/xBox/xBox.js'

const router = useRouter()
const win = window as any
const configStore = useConfigStore()
const menuStore = useMenuStore()
const popBoxRef = ref<HTMLElement | null>(null)

const test = async () => {
  console.info('test begin')
  let start = await win.myApi.waitSign()
  console.info(start)
  console.info('test end')
}

onMounted(async () => {
  // 获取解析菜单
  let jsonStr = await win.myApi.getMenu('configData')
  if(jsonStr != '' && jsonStr != undefined && jsonStr != null)
    parseMenuConfig(jsonStr)
  // console.info(jsonStr)
  // 连接硬件
  conState.value = await testConnection()
  // 主页面监听
  win.myApi.storeChangeListen((objData) => {
    // console.info('homePage listening', objData)
    // 有 get 属性
    if (objData.get) {
      let storeValue = objData.get
      let tempObj = {}
      tempObj[storeValue] = configStore[storeValue]
      if (typeof configStore[storeValue] == 'object') {
        tempObj[storeValue] = JSON.stringify(configStore[storeValue])
      }
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
      XBox.popMes('同步信息错误')
    }
  })
  // 右键菜单
  win.oncontextmenu = function (e) {
    e.preventDefault()
    // console.info(e)
    let topData = e.clientY
    let leftData = e.clientX
    if (topData > 250) topData = 250
    if (leftData > 450) leftData = 450
    menuStore.setPosition(topData, leftData)
    menuStore.setMenuShow(true)
    // console.info(menuStore.menuShow)
  }
  window.onclick = function (e) {
    // console.info(e)
    menuStore.setPosition('', '')
    menuStore.setMenuShow(false)
  }
})

// 打开键值编辑窗口
const openConfigWindow = async (index: number) => {
  configStore.setConfigIndex(index)
  // 重置单键配置
  for (let i = 0; i < 6; i++) {
    configStore.setCurEvent(i)
    let temp = {
      userKey: '',
      genKey: ''
    }
    configStore.setKeyConfig(JSON.stringify(temp))
  }
  if (configStore.layerKeyConfig[index].length != 0) {
    for (let i = 0; i < 6; i++) {
      configStore.setCurEvent(i)
      let temp = {
        userKey: configStore.layerKeyConfig[index][i].userKey,
        genKey: configStore.layerKeyConfig[index][i].genKey
      }
      configStore.setKeyConfig(JSON.stringify(temp))
    }
  }
  // console.info(configStore.keyConfig)
  createWindow('/config')
  // await new Promise(resolve => setTimeout(resolve, 1000));
}

const createWindow = (route: string) => {
  // console.log(router)
  // console.log(router.currentRoute.value.path)
  win.myApi.createNewWindow(
    {
      route: route
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

// 点击标题手动连接
const titleClick = async () => {
  conState.value = await testConnection()
}


// 同步一层配置的功能
watch(
  () => configStore.keyConfig,
  () => {
    configStore.setLayerKeyConfig(JSON.stringify(configStore.keyConfig))
    storageCurMenu()
  },
  {
    deep: true
  }
)

// 数据上传页面显示
const progressShow = ref<boolean>(false)
// 发送最终数据
const sendFinalData = async () => {
  configStore.setProgressMes(0)
  progressShow.value = true
  // 测试连接
  conState.value = await win.myApi.connectHardware()
  if (!conState.value) {
    XBox.popMes('硬件已经断开连接')
    configStore.setProgressMes(0)
    progressShow.value = false
    return
  }
  await new Promise((resolve) => setTimeout(resolve, 1))
  // 显示过程页面，发送到硬件
  progressShow.value = true
  // 记录当前菜单
  let curMenu = configStore.curMenu
  // 发送菜单
  await sendMenu()
  let activerNum = configStore.activeMenu.filter((o) => o).length
  let count = 0
  // console.info(configStore.activeMenu)

  for (let i = 0; i < 10; i++) {
    if (configStore.activeMenu[i]) {
      setMenu(i)
      // 发送键值
      await sendConfigData()
      count += 3
      configStore.setProgressMes(Math.ceil((count / activerNum) * 10))
      // 发送单色屏幕
      await sendOledScreen()
      count += 3
      configStore.setProgressMes(Math.ceil((count / activerNum) * 10))
      // 发送彩色屏幕
      await sendColorScreen()
      count += 4
      configStore.setProgressMes(Math.ceil((count / activerNum) * 10))
    }
  }
  configStore.setProgressMes(100)
  await new Promise((resolve) => setTimeout(resolve, 110))
  progressShow.value = false
  setMenu(curMenu)
}

// 切换菜单
const setMenu = (index: number) => {
  resetData()
  configStore.setCurMenu(index)
  loadMenu()
}

// 菜单切换
const menuIndex = ref<number>(1)
const menuChange = (func: number) => {
  // 存储当前菜单
  storageCurMenu()
  // 重置数据
  resetData()
  // console.info(configStore.menuConfig)
  if (func) {
    // 修改菜单索引
    menuIndex.value >= 10 ? (menuIndex.value = 1) : (menuIndex.value += 1)
  } else {
    menuIndex.value <= 1 ? (menuIndex.value = 10) : (menuIndex.value -= 1)
  }
  configStore.setCurMenu(menuIndex.value - 1)
  // 赋值数据
  loadMenu()
  // console.info(configStore.layerKeyConfig)
  // 显示图片
  const imgList: HTMLElement[] = new Array(imgOneRef.value, imgTwoRef.value, imgThreeRef.value)
  for (let i = 0; i < 3; i++) {
    let baseStr = configStore.screenData[i].baseData
    if (baseStr != '') imgList[i].src = `data:image/png;base64,${baseStr}`
    else imgList[i].src = ''
  }
}

// 存储当前菜单配置
const storageCurMenu = () => {
  let tempObj = {
    keyConfig: configStore.layerKeyConfig,
    screenConfig: configStore.screenData
  }
  // 存储在全层数据
  configStore.setMenuConfig(JSON.stringify(tempObj))
  
}

// 显示屏幕编辑
const openScreenPage = (curScreen: number) => {
  configStore.setCurScreen(curScreen)
  createWindow('/screen')
}

// 屏幕图片组件
const imgOneRef = ref<HTMLElement | null>(null)
const imgTwoRef = ref<HTMLElement | null>(null)
const imgThreeRef = ref<HTMLElement | null>(null)

watch( configStore.screenData,
  () => {
    const imgList: HTMLElement[] = new Array(imgOneRef.value, imgTwoRef.value, imgThreeRef.value)
    let baseStr = configStore.screenData[configStore.curScreen].baseData
    if (imgList[configStore.curScreen] != null && baseStr != '' && baseStr != undefined) imgList[configStore.curScreen].src = `data:image/png;base64,${baseStr}`
    else imgList[configStore.curScreen].src = ''
    storageCurMenu()
  },
  {
    deep: true
  }
)
const closeStorage = () => {
  // 存储全层菜单
  win.myApi.storageMenu('configData', JSON.stringify(configStore.menuConfig))
}

// 软件信息
const infoShow = ref<boolean>(false)
const showAppInfo = () => {
  infoShow.value = true
}

</script>

<template>
  <div id="app-info" v-if="infoShow" @click.stop="infoShow = false">
    <AppInfo @click.stop="" />
  </div>
  <ContextMenu />
  <PopBox ref="popBoxRef" />
  <div class="container">
    <WindowTitle @click="closeStorage">
      <template #title>
        <div id="window-title">
          <div @click="showAppInfo">MultiPad</div>
          <div id="con-state" @click.stop="titleClick" :style="{ background: conState ? stateMes[1].bgStyle : stateMes[0].bgStyle }">
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
          <div @click="openScreenPage(0)">
            <img src="" alt="" ref="imgOneRef" />
          </div>
        </div>
        <div class="div6">
          <div @click="openScreenPage(1)">
            <img src="" alt="" ref="imgTwoRef" />
          </div>
        </div>
        <div class="div7">
          <div @click="openScreenPage(2)">
            <img src="" alt="" ref="imgThreeRef" />
          </div>
        </div>
        <div class="div8">
          <div id="send-box" @click="sendFinalData">发送</div>
          <div id="menu-box">
            <div @click="menuChange(0)">
              <svg t="1710603270811" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7687" width="20" height="20">
                <path
                  d="M659.748571 245.272381l-51.687619-51.687619-318.439619 318.585905 318.415238 318.268952 51.712-51.736381-266.703238-266.556952z"
                  p-id="7688"
                  class="sweezy-custom-cursor-hover"
                  style='null;cursor: url("data:image/png;base64,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") 7 1, pointer !important;'
                  data-spm-anchor-id="a313x.collections_detail.0.i0.62783a81stkprB"
                  fill="#e6e6e6"
                ></path>
              </svg>
            </div>
            <div>
              <span>{{ menuIndex }}</span>
              <div id="menu-text">MENU</div>
            </div>
            <div @click="menuChange(1)">
              <svg t="1710603414798" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8201" width="20" height="20">
                <path d="M605.086476 512.146286L338.358857 245.272381l51.760762-51.687619 318.415238 318.585905L390.095238 830.415238l-51.687619-51.736381z" p-id="8202" fill="#e6e6e6"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="div3">
        <div>
          <div @click.stop="openConfigWindow(0)"></div>
          <div @click.stop="openConfigWindow(2)"></div>
          <div @click.stop="openConfigWindow(4)"></div>
          <div @click.stop="openConfigWindow(6)"></div>

          <div @click.stop="openConfigWindow(1)"></div>
          <div @click.stop="openConfigWindow(3)"></div>
          <div @click.stop="openConfigWindow(5)"></div>
          <div @click.stop="openConfigWindow(7)"></div>
        </div>
      </div>
      <div class="div4" @click.stop="openConfigWindow(10)"></div>
    </div>
    <ProgressBox v-if="progressShow" />
  </div>
</template>

<style lang="scss">
#app-info {
  @include full_wh;
  @include pos_ab;
  // @include style_common(12px, rgba(51, 51, 51, 0.2));
  z-index: 88;
}
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
  @include flex_center;
  @include style_common(12px, rgba(51, 51, 51, 0.2));
  font-size: 17px;
  position: relative;
  #mes-box {
    width: 150px;
    height: 70px;
    @include pos_ab(-84px, 50%, 3);
    transform: translateX(-50%);

    padding: 10px;
    word-break: break-all;
    display: none;
    @include style_common(9px, rgba(103, 109, 115, 1));
  }
  #mes-box::after {
    content: '';
    width: 30px;
    height: 10px;
    transform: translateX(-50%);
    @include pos_ab(-10px, 50%, 0);
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
  @include full_wh;
  @include ab_center;
  @include style_common(15px, rgba(51, 51, 51, 0.2));
  z-index: 998;
}

.container {
  width: 95%;
  height: 100%;
  @include pos_ab(50%, 50%, 0);
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
  @include wh(100%, 400px);
  @include grid_config(7, 5);
  overflow: hidden;
}
.div1 {
  grid-area: 1 / 1 / 3 / 2;
  @include flex_config(1, space-around);
  div {
    width: 75px;
    height: 75px;
    @include style_common(50%, rgba(12, 14, 20, 1));
    cursor: pointer;
  }
}
.div2 {
  grid-area: 1 / 2 / 3 / 8;
  @include grid_config(7, 3, 16px, 16px);

  padding-left: 10px;
  div {
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
  }
  img {
    @include full_wh;
  }
  img[src=''] {
    opacity: 0;
  }
  .div5 {
    grid-area: 1 / 1 / 4 / 4;
    div {
      width: 200px;
      height: 108px;
      margin: 10px auto;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0.1px 0px 5.3px rgba(0, 0, 0, 0.016), 0.4px 0px 17.9px rgba(0, 0, 0, 0.027), 2px 0px 80px rgba(0, 0, 0, 0.05);
    }
  }
  .div6 {
    grid-area: 1 / 4 / 3 / 6;
    div {
      width: 120px;
      height: 66px;
      margin: 10px auto;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0.1px 0px 5.3px rgba(0, 0, 0, 0.016), 0.4px 0px 17.9px rgba(0, 0, 0, 0.027), 2px 0px 80px rgba(0, 0, 0, 0.05);
    }
  }
  .div7 {
    grid-area: 1 / 6 / 3 / 8;
    div {
      width: 120px;
      height: 66px;
      margin: 10px auto;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0.1px 0px 5.3px rgba(0, 0, 0, 0.016), 0.4px 0px 17.9px rgba(0, 0, 0, 0.027), 2px 0px 80px rgba(0, 0, 0, 0.05);
    }
  }
  .div8 {
    grid-area: 3 / 4 / 4 / 8;
    @include flex_config(0, flex-start);
    padding: 5px;
    color: rgba(255, 255, 255, 1);
    user-select: none;
    #send-box {
      width: 90px;
      height: 100%;
      @include style_common(2px, rgba(191, 205, 211, 0.909));
      word-break: keep-all;
      @include flex_center;
      font-size: 15px;
      margin-right: 15px;
    }
    #menu-box {
      width: 170px;
      height: 100%;
      background: rgba(191, 205, 211, 0.7);
      @include flex_config(0, space-between);
      > div {
        width: 30%;
        height: 100%;
        background: rgba(51, 51, 51, 0.4);
        @include flex_center;
        font-size: 20px;
        position: relative;
      }
      #menu-text {
        // width: 40px;
        // height: 20px;
        font-size: 9px;
        transform: rotate(-90deg);
        @include pos_ab(11px, -5px, 3);
        background: rgba(51, 51, 51, 0);
      }
    }
  }
}
.div3 {
  grid-area: 3 / 1 / 6 / 6;
  padding-top: 15px;
  @include flex_config(0, flex-start);

  > div {
    width: 100%;
    height: 210px;
    @include grid_config(4, 2, 15px, 15px);
    // background: rgba($color: #000000, $alpha: 0.4);
    background-color: #cfaaac;
    background-image: linear-gradient(62deg, #cfaaac 0%, #a9b7c0 100%);
    border-radius: 12px;
    div {
      cursor: pointer;
      @include style_common(12px, rgba($color: #000000, $alpha: 0.4));
    }
  }
}
.div4 {
  grid-area: 3 / 6 / 6 / 8;
  width: 210px;
  height: 210px;
  @include style_common(50%, rgba(12, 14, 20, 1));
  position: fixed;
  right: -40px;
  bottom: 20px;
  cursor: pointer;
}
</style>
