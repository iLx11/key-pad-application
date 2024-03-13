import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

interface IConfigKey {
  [eventIndex: number]: {
    userKey: string,
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
  const keyConfig = reactive<IConfigKey>(new Array(6).fill({
    userKey: '',
    genKey: ''
  }))
  // 当前硬件的配置事件
  const curEvent = ref<number>(0)
  const setCurEvent = (cur: number) => {
    curEvent.value = cur
  }
  
  const setKeyConfig = (objData: any) => {
    keyConfig[curEvent.value] = JSON.parse(objData)
  }
  return { 
    noticeText,
    isTextShow,
    setIsTextShow,
    setNoticeText,
    notice,
    keyConfig,
    setKeyConfig,
    curEvent,
    setCurEvent,
    configIndex, 
    setConfigIndex,
    funcShow,
    setFuncShow,
   }
})
