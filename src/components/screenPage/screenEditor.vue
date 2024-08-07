<script setup="{ emit }" lang="ts">
import { onMounted, nextTick, ref } from 'vue'

import { editorConfig } from '../../utils/theme'
import 'tui-image-editor/dist/tui-image-editor.css'
import { useConfigStore } from '../../stores/configStore'
import ImageEditor from 'tui-image-editor/dist/tui-image-editor.js'
import { config } from 'process'
import {XBox} from '@/utils/xBox/xBox.js'

const win = window as any
const emits = defineEmits(['editorCancle', 'editorCommit'])
const configStore = useConfigStore()

onMounted(() => {
  nextTick(() => {
    instance.value = new ImageEditor(document.querySelector('#editor'), editorConfig)
  })
})
let instance = ref(null)

const imgArr: Array<string> = ['./img/black.png', './img/blank.png', './img/1.jpg', './img/2.png', './img/3.png', './img/4.png', './img/5.png' ]
const curImg = ref<number>(0)
// 切换反色背景
const switchBack = () => {
  curImg.value < 6 ? curImg.value ++ : curImg.value = 0
  // console.info(curImg.value)
  let img = imgArr[curImg.value]
  let color = curImg.value == 1 ? '#000000' : '#ffffff';

  (instance as any).value.loadImageFromURL(img, 'blank').then((result) => {
    (instance as any).value.addText('', {
      position: {},
      styles: {
        fill: color,
        fontSize: 85,
        fontFamily: '',
        fontStyle: '',
        fontWeight: '',
        underline: ''
      }
    })
  })
}

// 编辑信息提交
const editorCommit = async () => {
  const picBase64Str = (instance as any).value.toDataURL()
  let data, arrData
  XBox.popMes('处理数据中...')
  coverShow.value = true
  if(configStore.curScreen < 1) {
    // 缩放图片（1 为单色屏幕）
    data = await win.myApi.resizeImage(320, 172, picBase64Str, 0)
    // 获取取模数据
    arrData = await win.myApi.generateResultArray(data, 120, 1, 2, 0, 0, 0)
  } else {
    // 缩放图片（1 为单色屏幕）
    data = await win.myApi.resizeImage(72, 40, picBase64Str, 1)
    // 获取取模数据
    arrData = await win.myApi.generateResultArray(data, 120, 1, 2, 0, 0, 1)
  }
  console.info(arrData) 
  let tempObj: object = {}
  tempObj['screenData'] = JSON.stringify({
    baseData: data,
    buffData: arrData
  })
  win.myApi.setConfigStore(tempObj)
  coverShow.value = false
  win.myApi.closeWindow()
}

const closeWindow = () => {
  win.myApi.closeWindow()
}

const coverShow = ref<boolean>(false)
</script>

<template>
  <div id="cover" v-if="coverShow"></div>
  <div id="editor"></div>
  <div id="tools-bar">
    <ul>
      <li>
        <div @click="switchBack">切换</div>
      </li>
      <li>
        <div @click="closeWindow">取消</div>
      </li>
      <li>
        <div @click="editorCommit">确认</div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
#cover {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(51, 51, 51, 0.2);
  border-radius: 15px;
  z-index: 9999998;
}

.editor-tools {
  width: 50px;
  height: 30px;
  background: white;
  box-sizing: border-box;
}

#tools-bar {
  width: 8%;
  height: 50%;
  position: absolute;
  top: 50%;
  right: 0px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 1);
  border-radius: 12px;
  box-shadow: 1.1px 0px 10.8px -34px rgba(0, 0, 0, 0.059), 7px 0px 81px -34px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(51, 51, 51, 0.2);
  padding: 0;
  margin: 0;
  z-index: 9999;

  ul {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-around;
    align-items: center;
    padding: 0;
    margin: 0;

    :nth-child(3) > div {
      background: rgba(243, 226, 224, 1);
    }

    li {
      height: 10%;
      width: 100%;
      list-style: none;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      div {
        width: 60px;
        height: 50px;
        border-radius: 9px;
        border: 0.2px solid rgba(51, 51, 51, 0.1);
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>
