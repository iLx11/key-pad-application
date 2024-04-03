import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

interface IConfigKey {
  [eventIndex: number]: {
    userKey: string
    genKey: string
  }
}

export const useConfigStore = defineStore('config', () => {
  // 发送通知
  const noticeText = ref<string>('')
  const isTextShow = ref<boolean>(false)
  const setNoticeText = (text: string) => {
    noticeText.value = text
  }
  const setIsTextShow = (state: boolean) => {
    isTextShow.value = state
  }
  const notice = (text: string) => {
    setNoticeText(text)
    setIsTextShow(true)
  }

  // 菜单配置
  const curMenu = ref<number>(0)
  const setCurMenu = (menuIndex: number) => {
    curMenu.value = menuIndex
  }
  // 全十层的配置
  const menuConfig = reactive(
    new Array(10).fill({
      keyConfig: [],
      screenConfig: []
    })
  )
  const setMenuConfig = (configData: string) => {
    menuConfig[curMenu.value] = JSON.parse(configData)
  }
  
  // 菜单的激活状态
  const activeMenu = reactive(new Array(10).fill(0))
  const setActiveMenu = (index: number, state: number) => {
    activeMenu[index] = state
  }

  // 编辑的索引（一层中哪一个硬件）
  const configIndex = ref<number>(0)
  const setConfigIndex = (index: number) => {
    configIndex.value = index
  }

  // 功能函数激活
  const funcShow = ref<boolean>(false)
  const setFuncShow = (state: boolean) => {
    funcShow.value = state
  }

  // 单键配置
  const keyConfig = reactive<IConfigKey>(
    new Array(6).fill({
      userKey: '',
      genKey: ''
    })
  )
  // 当前硬件的配置事件
  const curEvent = ref<number>(0)
  const setCurEvent = (cur: number) => {
    curEvent.value = cur
  }
  // 设置单键配置的功能
  const setKeyConfig = (objData: string) => {
    keyConfig[curEvent.value] = JSON.parse(objData)
  }

  // 一层配置的功能数据
  const layerKeyConfig = reactive(new Array(11).fill([]))
  const setLayerKeyConfig = (ArrData: string) => {
    layerKeyConfig[configIndex.value] = JSON.parse(ArrData)
  }
  // 发送流程数据
  const progressMes = ref<number>(0)
  const setProgressMes = (mes: number) => {
    progressMes.value = mes
  }
  // 当前编辑的屏幕
  const curScreen = ref<number>(0)
  const setCurScreen = (cur: number) => {
    curScreen.value = cur
  }
  // 编辑图片的数据
  const screenData = reactive(
    new Array(3).fill(
      new Object({
        baseData: '',
        buffData: []
      })
    )
  )
  const setScreenData = (objData: string) => {
    screenData[curScreen.value] = JSON.parse(objData)
  }
  return {
    noticeText,
    isTextShow,
    setIsTextShow,
    setNoticeText,
    notice,
    curMenu,
    setCurMenu,
    menuConfig,
    setMenuConfig,
    activeMenu,
    setActiveMenu,
    keyConfig,
    setKeyConfig,
    curEvent,
    setCurEvent,
    configIndex,
    setConfigIndex,
    funcShow,
    setFuncShow,
    layerKeyConfig,
    setLayerKeyConfig,
    progressMes,
    setProgressMes,
    curScreen,
    setCurScreen,
    screenData,
    setScreenData
  }
})
