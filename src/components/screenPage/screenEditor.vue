<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, ref } from 'vue'

import { editorConfig } from '../../utils/theme'
import 'tui-image-editor/dist/tui-image-editor.css'
import ImageEditor from 'tui-image-editor/dist/tui-image-editor.js'
import { XBox } from 'ilx1-x-box'
import type { ScreenFrame } from './screenContent'

const win = window as any
const props = defineProps<{ screen: number; initialImage?: string }>()
const emit = defineEmits<{ save: [frame: ScreenFrame] }>()
const instance = shallowRef<{
  loadImageFromURL: (url: string, name: string) => Promise<unknown>
  addText: (text: string, options: object) => Promise<unknown>
  toDataURL: () => string
  destroy: () => void
}>()

onMounted(() => {
  const editor = new ImageEditor(document.querySelector('#editor'), editorConfig)
  instance.value = editor
  if (props.initialImage) {
    editor.loadImageFromURL(`data:image/png;base64,${props.initialImage}`, 'screen').catch(() => {
      XBox.popMes('读取原屏幕图片失败')
    })
  }
})
onUnmounted(() => instance.value?.destroy())

const imgArr: Array<string> = ['./img/black.png', './img/blank.png', './img/1.jpg', './img/2.png', './img/3.png', './img/4.png', './img/5.png' ]
const curImg = ref<number>(0)
// 切换反色背景
const switchBack = () => {
  curImg.value < 6 ? curImg.value ++ : curImg.value = 0
  // console.info(curImg.value)
  let img = imgArr[curImg.value]
  let color = curImg.value == 1 ? '#000000' : '#ffffff';

  const editor = instance.value
  editor?.loadImageFromURL(img, 'blank').then(() => {
    return editor.addText('', {
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
  }).catch(() => XBox.popMes('切换背景失败'))
}

// 编辑信息提交
const editorCommit = async () => {
  if (!instance.value || coverShow.value) return
  XBox.popMes('处理数据中...')
  coverShow.value = true
  try {
    const picBase64Str = instance.value.toDataURL()
    const monochrome = props.screen !== 0
    const width = monochrome ? 72 : 320
    const height = monochrome ? 40 : 172
    const mode = Number(monochrome)
    const data = await win.myApi.resizeImage(width, height, picBase64Str, mode)
    const arrData = await win.myApi.generateResultArray(data, 120, 1, 2, 0, 0, mode)
    if (arrData.length !== width * height * (monochrome ? 1 / 8 : 2)) {
      throw new Error('Unexpected screen data size')
    }
    emit('save', { baseData: data, buffData: arrData })
  } catch (error) {
    console.error(error)
    XBox.popMes('屏幕图片处理失败，请重新选图')
  } finally {
    coverShow.value = false
  }
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
