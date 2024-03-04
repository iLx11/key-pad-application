<script setup lang="ts">
import { read } from 'fs'
import test from 'node:test'
import { reactive, ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { getStringMap } from '../utils/hidKeyCode'
import { toHexStr } from '../utils/strTools'

const configStore = useConfigStore()

const curSelected = ref<number>(0)

interface ISpeacialArr {
  [index: number]: {
    spId: number
    spName: string
    isSelect: boolean
  }
}
const specialKeyCode = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80]
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
watch(
  () => keyValue.value,
  () => {
    let reg = new RegExp(/[(\u4e00-\u9fa5)|(A-Z)]/)
    if (reg.test(keyValue.value)) {
      keyValue.value = keyValue.value.replace(reg, '')
      configStore.notice('只能输入英文小写字母~')
    }
  }
)
const changeSelect = (speacialId: number) => {
  speacialArr[speacialId].isSelect = !speacialArr[speacialId].isSelect
}

const keyCommit = () => {
  let count: number = 0
  let genKeyStr: string = ''
  let userKeyStr: string = ''
  speacialArr
    .filter((o) => o.isSelect)
    .forEach((x) => {
      count += specialKeyCode[x.spId]
      userKeyStr += x.spName + ' + '
    })
  try {
    // 处理键值索引
    for (let i of keyValue.value) {
      genKeyStr += getStringMap().get(i).hex
    }
  } catch (error) {
    configStore.notice('有错误产生，可能有不支持的字符')
    return
  }
  // 没有快捷键按普通按键处理
  if (count == 0) {
    userKeyStr = keyValue.value
    genKeyStr = `${genKeyStr}`
  } else {
    userKeyStr = userKeyStr.replace(/\+\s$/, '-> ') + keyValue.value
    genKeyStr = `${toHexStr(count)}${toHexStr(keyValue.value.length)}${genKeyStr}`
  }
  let tempObj = {
    listId: delayCompList.length == 0 ? 1 : delayCompList[delayCompList.length - 1].listId + 1,
    listStr: userKeyStr,
    isSelected: false,
    listGenStr: genKeyStr,
    kind: 0
  }
  if (curSelected.value != 0) delayCompList.splice(curSelected.value, 0, tempObj)
  else delayCompList.push(tempObj)
  console.info(delayCompList)
}

// ---------------------- 延迟部分 -------------------------
interface IDelayTime {
  delayS: string
  delayMs: string
}
const delayTime = reactive<IDelayTime>({
  delayS: '',
  delayMs: ''
})
watch(
  delayTime,
  () => {
    if (Number(delayTime.delayS) > 10) {
      configStore.notice('延时时间不能超过 10s')
      delayTime.delayS = '0'
    }
    if (Number(delayTime.delayMs) > 255) {
      configStore.notice('毫秒延时时间不能超过 255ms')
      delayTime.delayMs = '0'
    }
    let reg = new RegExp(/^\d+$/)
    if (!reg.test(delayTime.delayS)) {
      configStore.notice('请输入纯数字')
      delayTime.delayS = '0'
    }
    if (!reg.test(delayTime.delayMs)) {
      configStore.notice('请输入纯数字')
      delayTime.delayMs = '0'
    }
  },
  {
    deep: true
  }
)
interface IDelayComp {
  [index: number]: {
    listId: number
    listStr: string
    isSelected: boolean
    listGenStr: string
    kind: number
  }
}
const delayCompList = reactive<IDelayComp>([])
const deleteItem = (k: number) => {
  delayCompList.splice(k, 1)
}
const changeListSelect = (k: number) => {
  curSelected.value = k + 1
  if (delayCompList[k].isSelected == true) {
    curSelected.value = 0
    delayCompList[k].isSelected = false
    return
  }
  for (let o of delayCompList) o.isSelected = false
  delayCompList[k].isSelected = !delayCompList[k].isSelected
}
// 添加延迟列表
const delayCommit = () => {
  // 限制条件
  if (delayCompList.filter((o) => o.kind == 1).length > 8) {
    configStore.notice('延迟总数不能超过 9')
    return
  }
  if (delayTime.delayS == '0' && delayTime.delayMs == '0') {
    configStore.notice('不能添加 0 延时')
    return
  }
  if ((curSelected.value != delayCompList.length && delayCompList[curSelected.value].kind == 1) ||
  (curSelected.value != 0 && delayCompList[curSelected.value - 1].kind == 1) || 
  (delayCompList.length != 0 && delayCompList[delayCompList.length - 1].kind == 1)) {
    configStore.notice('不能添加连续的延时')
    return
  }
  // 生成与赋值
  let genDelayStr: string = ''
  genDelayStr += `${toHexStr(Math.floor((Number(delayTime.delayS) * 1000) / 255))}${toHexStr(Number(delayTime.delayMs))}`
  // 添加列表项
  let tempObj = {
    listId: delayCompList.length == 0 ? 1 : delayCompList[delayCompList.length - 1].listId + 1,
    listStr: `delay -> ${delayTime.delayS}s.${delayTime.delayMs}ms`,
    isSelected: false,
    listGenStr: genDelayStr,
    kind: 1
  }
  if (curSelected.value != 0) delayCompList.splice(curSelected.value, 0, tempObj)
  else delayCompList.push(tempObj)
  console.info(delayCompList)
}

// 提交
const commit = () => {
  let genKeyStr: string = ''
  // 获取延迟的数量,如果没有延迟按普通按键处理处理
  let delayCount = delayCompList.filter((o) => o.kind == 1).length
  // console.info(delayCount)
  // 获取是否有特殊按键，没有按普通延时处理
  if (!delayCompList.some((o) => /[RL]/.test(o.listStr))) {
    let tempStr: string = ''
    for (let i = 0; i < delayCompList.length; i++) {
      tempStr = ''
      // 判断是延迟还是键值
      while (i < delayCompList.length && delayCompList[i].kind == 0) {
        tempStr += delayCompList[i ++].listGenStr
      }
      genKeyStr += `${toHexStr(tempStr.length / 2)}${tempStr}`
      if(i < delayCompList.length &&delayCompList[i].kind == 1) {
        genKeyStr += `${delayCompList[i].listGenStr}`
      }
    }
    genKeyStr = `2${delayCount}${genKeyStr}`
  // 组合延迟键处理
  } else {
    let tempStr: string = ''
    for (let i = 0; i < delayCompList.length; i++) {
      tempStr = ''
      let compCount: number = 0
      // 判断是延迟还是键值
      while (i < delayCompList.length && delayCompList[i].kind == 0) {
        tempStr += delayCompList[i ++].listGenStr
        compCount ++
      }
      genKeyStr += `${toHexStr(compCount)}${tempStr}`
      if(i < delayCompList.length &&delayCompList[i].kind == 1) {
        genKeyStr += `${delayCompList[i].listGenStr}`
      }
    }
    genKeyStr = `3${delayCount}${genKeyStr}`
  }
  let userKeyStr = delayCompList.reduce((pre, cur) => pre += `${cur.listStr}\r\n`, '')
  configStore.keyConfig[configStore.curEvent] = {
    userKey: userKeyStr,
    genKey: genKeyStr
  }
  console.info(configStore.keyConfig[configStore.curEvent])
  // configStore.setFuncShow(false)
}
</script>

<template>
  <div id="comp-delay-content">
    <div class="div1">
      <ul>
        <li v-for="(v, k) in delayCompList" :key="v.listId" :class="{ listselected: v.isSelected }" @click="changeListSelect(k)">
          <span> {{ v.listStr }}</span>
          <div class="dele-box" @click.stop="deleteItem(k)">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M15 18v-2h4v2zm0-8V8h7v2zm0 4v-2h6v2zM3 8H2V6h4V4.5h4V6h4v2h-1v9q0 .825-.587 1.413T11 19H5q-.825 0-1.412-.587T3 17z" /></svg>
          </div>
        </li>
      </ul>
    </div>
    <div class="div2">
      <div id="comp-key-content">
        <div id="comp-special">
          <div v-for="v in speacialArr" :key="v.spId" :class="{ selected: v.isSelect }" @click="changeSelect(v.spId)">
            {{ v.spName }}
          </div>
        </div>
        <div id="key-input-box">
          <input type="text" v-model="keyValue" spellcheck="false" />
          <div id="commit-box" @click="keyCommit">添加</div>
        </div>
      </div>
    </div>
    <div class="div3">
      <div id="delay-config-box">
        <div>
          <input type="text" spellcheck="false" v-model="delayTime.delayS" />
        </div>
        <div>s</div>
        <div>
          <input type="text" spellcheck="false" v-model="delayTime.delayMs" />
        </div>
        <div>ms</div>
      </div>
      <div id="commit-box" @click="delayCommit">添加</div>
    </div>
    <div class="div4" @click="commit">确认</div>
  </div>
</template>

<style lang="scss" scoped>
#comp-delay-content {
  width: 85%;
  height: 85%;
  max-width: 900px;
  max-height: 700px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  background: rgb(255, 255, 255);

  overflow: hidden;
  border-radius: 25px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(8, 1fr);
  grid-column-gap: 25px;
  grid-row-gap: 25px;
  .div1 {
    grid-area: 1 / 1 / 9 / 4;
    background: rgba(229, 234, 235, 0.8);
    border-radius: 25px;
    ul {
      width: 100%;
      height: 100%;
      overflow: scroll;
      padding: 1.2em;
      li {
        width: 100%;
        height: auto;
        padding: 0.8em;
        border-radius: 12px;
        margin-bottom: 15px;
        background: rgba($color: #494c54, $alpha: 1);
        color: rgba(255, 255, 255, 1);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        word-break: break-all;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        div {
          width: 40px;
          height: 40px;
          border-radius: 50% 2px 2px 2px;
          background: rgba(255, 255, 255, 1);
          position: absolute;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          color: rgba($color: #494c54, $alpha: 1);
          cursor: pointer;
          display: none;
        }
      }
      li:hover {
        div {
          display: flex;
        }
      }
    }
  }
  .listselected {
    background: rgba(255, 255, 255, 1) !important;
    color: rgba($color: #494c54, $alpha: 1) !important;
    border: 5px solid rgb(236, 185, 185);
    font-size: 18px !important;
  }
  .div2 {
    grid-area: 1 / 4 / 5 / 8;
  }
  .div3 {
    grid-area: 5 / 4 / 8 / 8;
    position: relative;
  }
  .div4 {
    grid-area: 8 / 4 / 9 / 8;
    background: rgba(210, 168, 169, 0.5);
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: rgba(255, 255, 255, 1);
  }
}

#comp-key-content {
  width: 100%;
  height: 100%;
  // max-width: 600px;
  // max-height: 300px;
  z-index: 66;
  position: relative;
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
      background: rgba($color: #494c54, $alpha: 1);
      color: rgba(255, 255, 255, 1);
    }
  }
  #key-input-box {
    width: 100%;
    height: 55%;
    border-radius: 30px 30px 20px 20px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 4px rgba(191, 203, 206, 0.6);
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    input {
      width: 80%;
      height: 50%;
      text-align: center;
      font-size: 40px;
      outline: none;
      border: none;
    }
  }
}
#commit-box {
  width: 90px;
  height: 40px;
  background: rgba(210, 168, 169, 0.5);
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
#delay-config-box {
  width: 100%;
  height: 100%;
  border-radius: 25px;
  background: rgba(191, 203, 206, 0.4);
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  div {
    width: 20%;
    height: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
  }
  div:nth-child(1),
  div:nth-child(3) {
    border-radius: 12px;
    background: rgba($color: #494c54, $alpha: 1);
    input {
      width: 100%;
      height: 100%;
      outline: none;
      border: none;
      background: rgba(255, 255, 255, 0);
      color: rgba(255, 255, 255, 1);
      text-align: center;
    }
  }
}

.selected {
  background: rgba($color: #494c54, $alpha: 1) !important;
  color: rgb(219, 141, 141) !important;
  border-left: 1px solid rgba(255, 255, 255, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 1);
}
</style>
