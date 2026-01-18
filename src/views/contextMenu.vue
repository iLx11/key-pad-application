<script setup lang="ts">
import { onMounted, reactive, readonly, ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { useMenuStore } from '../stores/menuStore'
import { resetData, parseMenuConfig, loadMenu } from '../utils/dataHandle'
import { XBox } from 'ilx1-x-box'

const configStore = useConfigStore()
const menuStore = useMenuStore()
const menuRef = ref<HTMLElement | null>(null)
const menuShow = ref<boolean>(false)
const win = window as any
watch(
  () => menuStore.position,
  () => {
    if (menuStore.menuShow) {
      menuShow.value = true
      // menuStore.setMenuShow(false)
      setTimeout(() => {
        const menuBox = document.querySelector('#context-menu')
        menuBox.style.top = menuStore.position.top + 'px'
        menuBox.style.left = menuStore.position.left + 'px'
        menuBox.style.opacity = 100
      }, 2)
    } else if (!menuStore.menuShow) {
      // console.info(34)
      menuShow.value = false
    }
  },
  {
    deep: true
  }
)

const menuFunc = async (index: number) => {
  // console.info(index)
  if (index == 0) {
    let jsonObj = await win.myApi.getConfigFile()
    // console.info(jsonObj)
    // 菜单导入
    parseMenuConfig(jsonObj)
  } else if (index == 1) {
    // 获取文件名
    fileNameShow.value = true
  } else if (index == 2) {
    resetCurMenu()
    XBox.popMes('清除当层成功')
  } else if (index == 3) {
    // 清除所有层
    let curMenu = configStore.curMenu
    for (let i = 0; i < 10; i++) {
      configStore.setCurMenu(i)
      resetCurMenu()
      let tempObj = {
        keyConfig: configStore.layerKeyConfig,
        screenConfig: configStore.screenData
      }
      // 存储在全层数据
      configStore.setMenuConfig(JSON.stringify(tempObj))
    }
    configStore.setCurMenu(curMenu)
    XBox.popMes('清除所有层成功')
  }
}

const resetCurMenu = () => {
  // 清空单层数据
  resetData()
  let img = document.querySelectorAll('img')
  for (let i = 0; i < 3; i++) {
    img[i].src = ''
  }
}

const menuArr = reactive([
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><g fill="none" stroke="#ffffff" stroke-linecap="round" stroke-width="1.5"><path stroke-linejoin="round" d="M12 4v10m0 0l3-3m-3 3l-3-3"/><path d="M12 20a8 8 0 0 1-8-8m16 0a7.985 7.985 0 0 1-3 6.245"/></g></svg>`,
    text: `导入配置文件`,
    isHover: false
  },
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 512 512"><path d="M272 64h-16c-4.4 0-8 3.6-8 8v72c0 4.4 7.6 8 12 8h12c4.4 0 8-3.6 8-8V72c0-4.4-3.6-8-8-8z" fill="#ffffff"/><path d="M433.9 130.1L382 78.2c-9-9-21.3-14.2-34.1-14.2h-28c-8.8 0-16 7.3-16 16.2v80c0 8.8-7.2 16-16 16H160c-8.8 0-16-7.2-16-16v-80c0-8.8-7.2-16.2-16-16.2H96c-17.6 0-32 14.4-32 32v320c0 17.6 14.4 32 32 32h320c17.6 0 32-14.4 32-32V164c0-12.7-5.1-24.9-14.1-33.9zM322 400.1c0 8.8-8 16-17.8 16H143.8c-9.8 0-17.8-7.2-17.8-16v-96c0-8.8 8-16 17.8-16h160.4c9.8 0 17.8 7.2 17.8 16v96z" fill="#ffffff"/></svg>`,
    text: `保存配置文件`,
    isHover: false
  },
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="#ffffff" d="m14.03 1.889l9.657 9.657l-8.345 8.345l-.27.27H20v2H6.747l-3.666-3.666a4 4 0 0 1 0-5.657zm.322 16.163l6.507-6.506l-6.829-6.829l-6.828 6.829l6.828 6.828l.32-.323zM5.788 12.96l-1.293 1.293a2 2 0 0 0 0 2.828l3.08 3.08h4.68l.366-.368z"/></svg>`,
    text: `清空当前菜单`,
    isHover: false
  },
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 48 48"><g fill="none" stroke="#ffffff" stroke-linejoin="round" stroke-width="4"><path stroke-linecap="round" d="M20 5.914h8v8h15v8H5v-8h15z" clip-rule="evenodd"/><path d="M8 40h32V22H8z"/><path stroke-linecap="round" d="M16 39.898v-5.984m8 5.984v-6m8 6v-5.984M12 40h24"/></g></svg>`,
    text: `清空[所有]菜单`,
    isHover: false
  }
])

const fileNameShow = ref<boolean>(false)
const fileNameText = ref<string>('')
const writeFile = async () => {
  fileNameShow.value = false
  let configData = JSON.stringify(configStore.menuConfig)
  // 选择目录写入配置文件
  if(fileNameText.value != '')
    await win.myApi.writeConfigFile(fileNameText.value, configData)
  else 
    await win.myApi.writeConfigFile('MultiPad', configData)
}
</script>

<template>
  <div id="file-name" v-if="fileNameShow">
    <div id="cover" @click="writeFile"><span>请输入文件名</span><br><span>并点击黑色区域确定</span></div>
    <div><input type="text" spellcheck="false" v-model="fileNameText"></div>
  </div>
  <div id="context-menu" v-if="menuShow" ref="menuRef">
    <ul>
      <li v-for="(v, k) in menuArr" @click="menuFunc(k)">
        <div v-html="v.svg"></div>
        <div>{{ v.text }}</div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
#file-name {
  @include global.full_wh;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  @include global.flex_center;
  z-index: 8;
  border-radius: 32px;
  input {
    @include global.full_wh;
    border: none;
    text-align: center;
    font-size: 25px;
    font-family: "ceyy";
  }
  div {
    width: 300px;
    height: 60px;
    @include global.style_common(22px, rgba(255, 255, 255, 1));
    z-index: 8;
    overflow: hidden;
  }
  #cover {
    width: 70%;
    height: 60%;
    @include global.ab_center;
    background: rgba(51, 51, 51, 0.9);
    font-size: 28px;
    color: rgb(210, 207, 207);
    @include global.flex_config(1, space-evenly);
    padding: 1em;
    cursor: pointer;
  }
}
#context-menu {
  width: 200px;
  height: 220px;
  @include global.style_common(25px, rgb(252, 252, 252), 2px solid rgba(215, 220, 231, 1));
  position: absolute;
  // top: 0;
  // left: 0;
  z-index: 8888;
  color: rgba(255, 255, 255, 1);
  opacity: 0;
  padding: 0.4em;
  ul {
    @include global.full_wh;
    overflow-y: scroll;
    padding: 0.3em;

    li {
      width: 100%;
      height: 40px;
      @include global.style_common(11px, rgb(131, 141, 145));
      margin-bottom: 9px;
      @include global.flex_config(0, flex_start);
      padding: 0.3em;
      cursor: pointer;

      svg {
        color: rgba(255, 255, 255, 1);
      }
      div:nth-child(1) {
        width: 25%;
        height: 100%;
      }
      div:nth-child(2) {
        width: 70%;
        height: 100%;
      }
      div {
        @include global.flex_center;
      }
    }
    li:hover {
      background: rgb(84, 88, 89) !important;
    }
  }
}
</style>
