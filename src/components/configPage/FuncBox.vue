<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '../../stores/configStore'

const configStore = useConfigStore()
const router = useRouter()

const showFuncBox = (funcIndex: number) => {
  router.push(`/config/${funcIndex}`)
  configStore.setFuncShow(true)
}

const funcArray = reactive([
  {
    funcIndex: 0,
    funcName: '菜单控制',
    funcDesc: '设置切换上一级、下一级菜单或者切换到固定的菜单'
  },
  {
    funcIndex: 1,
    funcName: '组合键值',
    funcDesc: '普通按键或者包含特殊按键的快捷键，不限制长度'
  },
  {
    funcIndex: 2,
    funcName: '发送文本',
    funcDesc: '按键之后会打出设置好的文本，有长度限制，如果文本中包含中文，就需要借助上位机'
  },
  {
    funcIndex: 3,
    funcName: '组合延迟键值',
    funcDesc: '组合键值中可以穿插延迟，适用于需要等待加载的场合'
  },
  {
    funcIndex: 4,
    funcName: '打开文件/应用',
    funcDesc: '通过设置路径来打开对应的文件或应用'
  },
  {
    funcIndex: 5,
    funcName: '媒体按键',
    funcDesc: '设置固定的媒体按键，类似打开计算器，或音量控制之类的应用'
  },
  {
    funcIndex: 6,
    funcName: '鼠标控制',
    funcDesc: '可以设置鼠标上下左右移动的距离，左中右键的点击，以及中键的上下位移'
  },
  {
    funcIndex: 7,
    funcName: '特殊按键',
    funcDesc: '特殊的按键类似 F1、方向键、删除键...'
  }
])
</script>

<template>
  <div id="func-content">
    <ul>
      <li v-for="v in funcArray" :key="v.funcIndex" @click="showFuncBox(v.funcIndex)">
        <div class="func-name">
          {{ v.funcName }}
          <div class="func-desc"></div>
          <span>
            {{ v.funcDesc }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
#func-content {
  width: 100%;
  height: 100%;
  ul {
    width: 100%;
    height: 100%;
    overflow: scroll;
  }
  .func-name {
    width: 100%;
    height: 80px;
    background: rgba(255, 255, 255, 0.7);
    margin-bottom: 20px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 23px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    .func-desc {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(72, 76, 85, 1);
      position: absolute;
      top: -160%;
      right: 0%;
      z-index: 66;
      transition: all 0.7s ease-in-out;
    }
    span {
      width: 100%;
      height: 100%;
      font-size: 17px;
      position: absolute;
      color: rgba(255, 255, 255, 1);
      word-break: break-all;
      z-index: 67;
      transition: all 0.7s ease-in-out;
      opacity: 0%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.2em 2em ;

    }
  }
  .func-name:hover {
    .func-desc {
      width: 500px;
      height: 500px;
    }
    span {
      opacity: 100%;
    }
  }
}
</style>
