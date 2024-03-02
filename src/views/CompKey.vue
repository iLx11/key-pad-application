<script setup lang="ts">
import { compileFunction } from "vm";
import { reactive, ref } from "vue";
import { useConfigStore } from '../stores/configStore'
import { getStringMap } from "../utils/hidKeyCode";
import { toHexStr } from "../utils/strTools"

const configStore = useConfigStore()

interface ISpeacialArr {
  [index: number]: {
    spId: number,
    spName: string,
    isSelect: boolean
  }
}
const specialKeyCode = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];
const speacialArr = reactive<ISpeacialArr>([
  {
    spId: 0,
    spName: 'LCtrl',
    isSelect: false
  },
  {
    spId: 1,
    spName: 'LShift',
    isSelect: false
  },
  {
    spId: 2,
    spName: 'LAlt',
    isSelect: false
  },
  {
    spId: 3,
    spName: 'LGUI',
    isSelect: false
  },
  {
    spId: 4,
    spName: 'RCtrl',
    isSelect: false
  },
  {
    spId: 5,
    spName: 'RShift',
    isSelect: false
  },
  {
    spId: 6,
    spName: 'RAlt',
    isSelect: false
  },
  {
    spId: 7,
    spName: 'RGUI',
    isSelect: false
  }
])
const keyValue = ref<string>('')
// 输入框改变
const keyValueChange = () => {
  let reg = new RegExp(/[(\u4e00-\u9fa5)|(A-Z)]/)
  if(reg.test(keyValue.value)) {
    keyValue.value = keyValue.value.replace(reg, '')
    configStore.notice('只能输入英文小写字母~')
  }
}
const changeSelect = (speacialId: number) => {
  speacialArr[speacialId].isSelect = !speacialArr[speacialId].isSelect

}

// 提交
const commit = () => {
  let count: number = 0
  let genKeyStr: string = ''
  let userKeyStr: string = ''
  speacialArr.filter(o => o.isSelect).forEach(x => {
    count += specialKeyCode[x.spId]
    userKeyStr += x.spName + ' + '
  })
  // 处理键值索引
  for(let i of keyValue.value) {
    genKeyStr += getStringMap().get(i).hex
  }
  // 没有快捷键按普通按键处理
  if(count == 0) {
    userKeyStr = keyValue.value
    genKeyStr = `0${toHexStr(keyValue.value.length)}${genKeyStr}`
  } else {
    userKeyStr = userKeyStr.replace(/\+\s$/, '-> ') + keyValue.value
    genKeyStr = `101${ toHexStr(count) }${ toHexStr(keyValue.value.length) }${genKeyStr}`
  }
  // console.info(genKeyStr)
  configStore.keyConfig[configStore.curEvent] = {
    userKey: userKeyStr,
    genKey: genKeyStr
  }
  console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}


</script>

<template>
  <div id="comp-key-content">
    <div id="comp-special">
      <div v-for="v in speacialArr" :key="v.spId" :class="{ selected: v.isSelect }" @click="changeSelect(v.spId)">
        {{ v.spName }}
      </div>
    </div>
    <div id="key-input-box">
      <input type="text" v-model="keyValue" @input="keyValueChange"/>
      <div id="commit-box" @click="commit">
        确认
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#comp-key-content {
  width: 60%;
  height: 50%;
  max-width: 600px;
  max-height: 300px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  // background: rgba($color: #000000, $alpha: 0.3);
  #comp-special {
    width: 100%;
    height: 70%;
    border-radius: 35px 35px 0 0;
    background: rgba($color: #494c54, $alpha: 1);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 25%);
    padding: 20px;
    grid-column-gap: 15px;
    grid-row-gap: 16px;
    div {
      border-radius: 5px;
      background: rgba(255, 255, 255, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
    div:hover {
      background:rgba($color: #494c54, $alpha: 1);
      color: rgba(255, 255, 255, 1);
    }
  }
  #key-input-box {
    width: 100%;
    height: 55%;
    border-radius: 30px 30px 12px 12px;
    background: rgba(255, 255, 255, 1);
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    input {
      width: 80%;
      height: 50%;
      text-align: center;
      font-size: 45px;
      outline: none;
      border: none;
    }
    #commit-box {
      width: 120px;
      height: 50px;
      background: rgba(210, 168, 169, 0.8);
      position: absolute;
      right: 20px;
      bottom: 20px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      color: rgba(255, 255, 255, 1);
    }
  }
}
.selected {
  background:rgba($color: #494c54, $alpha: 1) !important;
  color: rgb(219, 141, 141) !important;
  border-left: 1px solid rgba(255, 255, 255, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 1);
}
</style>
