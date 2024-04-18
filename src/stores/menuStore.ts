import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', () => {
  const position = reactive({
    top: '',
    left: ''
  })
  const setPosition = (top: string, left: string) => {
    position.top = top
    position.left = left
  }

  const menuShow = ref<boolean>(false)
  const setMenuShow = (state: boolean) => {
    menuShow.value = state
  }

  return { 
    position,
    setPosition,
    menuShow,
    setMenuShow
  }
})
