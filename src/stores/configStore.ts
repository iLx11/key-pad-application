import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // 编辑的索引
  const configIndex = ref<number>(0)
  const setConfigIndex = (index: number) => {
    configIndex.value = index
  }

  // 功能函数激活
  const funcShow = ref<boolean>(false)
  const setFuncShow = (state: boolean) => {
    funcShow.value = state
  }

  // 组合键值配置
  return { 
    configIndex, 
    setConfigIndex,
    funcShow,
    setFuncShow
   }
})
