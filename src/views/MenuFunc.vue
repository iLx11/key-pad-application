<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { toHexStr } from '../utils/strTools'

const configStore = useConfigStore()
const menuValue = ref<string>('')
const menuSelect = reactive({
  preMenu: false,
  nextMenu: false
})

watch(
  () => menuValue.value,
  () => {
    let reg = new RegExp(/^\d+$/)
    if (!reg.test(menuValue.value)) {
      configStore.notice('请输入纯数字')
      menuValue.value = '0'
    }
    if (Number(menuValue.value) > 10 || Number(menuValue.value) < 0) {
      configStore.notice('调转的菜单不能超过 10')
      menuValue.value = '0'
    }
    if (menuValue.value !== '0') {
      menuSelect.preMenu = false
      menuSelect.nextMenu = false
    }
  }
)

const selectChange = (state: boolean) => {
  menuSelect.preMenu = !state
  menuSelect.nextMenu = state
  menuValue.value = '0'
}

const commit = () => {
  let genKeyStr: string = ''
  let userKeyStr: string = ''
  if (menuValue.value !== '0' && menuValue.value !== '') {
    genKeyStr = `60${Number(menuValue.value)}`
    userKeyStr = `指定跳转到菜单 ${Number(menuValue.value)}`
  } else {
    if (menuSelect.preMenu) {
      genKeyStr = `600`
      userKeyStr = `上一级菜单`
    } else {
      genKeyStr = `610`
      userKeyStr = `下一级菜单`
    }
  }
  console.info(genKeyStr)
  configStore.keyConfig[configStore.curEvent] = {
    userKey: userKeyStr,
    genKey: genKeyStr
  }
  console.info(configStore.keyConfig)
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="menu-func-content">
    <div :class="{ isSelect: menuSelect.preMenu }" @click="selectChange(false)">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="m10 7.403l-7.007 3.125c-1.324.59-1.324 2.354 0 2.944l16.51 7.363c1.495.667 3.047-.814 2.306-2.202l-3.152-5.904c-.245-.459-.245-1 0-1.458l3.152-5.904c.74-1.388-.81-2.87-2.306-2.202L14.75 5.284" />
      </svg>
    </div>
    <div>
      <input type="text" spellcheck="false" placeholder="指定菜单" v-model="menuValue" />
    </div>
    <div :class="{ isSelect: menuSelect.nextMenu }" @click="selectChange(true)">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="m14 16.597l7.007-3.125c1.324-.59 1.324-2.354 0-2.944L4.497 3.164c-1.495-.667-3.047.814-2.306 2.202l3.152 5.904c.245.459.245 1 0 1.458l-3.152 5.904c-.74 1.388.81 2.87 2.306 2.202l4.752-2.119" />
      </svg>
    </div>
    <div id="commit-box" @click="commit">确认</div>
  </div>
</template>

<style lang="scss" scoped>
.isSelect {
  background: rgba($color: #494c54, $alpha: 1) !important;
  color: rgb(219, 141, 141) !important;
  border: 2px solid rgba(217, 224, 226, 1);
}
#menu-func-content {
  width: 60%;
  height: 30%;
  max-width: 1200px;
  max-height: 600px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  background: rgba(255, 255, 255, 1);
  border-radius: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 25px;
  color: rgba(255, 255, 255, 1);
  font-size: 1.4em;
  div {
    width: 25%;
    height: 60%;
    border-radius: 25px;
    background: rgba($color: #494c54, $alpha: 1);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  input {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 1);
    outline: none;
    border: none;
    text-align: center;
    font-size: 35px;
    color: rgba(51, 51, 51, 1);
    border: 3px solid rgba(217, 224, 226, 1);
    border-radius: 20px;
    font-size: 20px;
  }
  #commit-box {
    width: 90px;
    height: 40px;
    background: rgba(210, 168, 169, 0.5);
    position: absolute;
    right: 20px;
    bottom: 12px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: rgba(255, 255, 255, 1);
  }
}
</style>
