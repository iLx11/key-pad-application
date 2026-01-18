<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { getStringMap } from '../utils/hidKeyCode'
import { toHexStr } from '../utils/strTools'

const configStore = useConfigStore()

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
    isSelect: false,
  },
  {
    spId: 1,
    spName: 'LShift',
    isSelect: false,
  },
  {
    spId: 2,
    spName: 'LAlt',
    isSelect: false,
  },
  {
    spId: 3,
    spName: 'LGUI',
    isSelect: false,
  },
  {
    spId: 4,
    spName: 'RCtrl',
    isSelect: false,
  },
  {
    spId: 5,
    spName: 'RShift',
    isSelect: false,
  },
  {
    spId: 6,
    spName: 'RAlt',
    isSelect: false,
  },
  {
    spId: 7,
    spName: 'RGUI',
    isSelect: false,
  },
])
const keyValue = ref<string>('')
// 输入框改变
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

// 提交
const commit = () => {
  let count: number = 0
  let genKeyStr: string = ''
  let userKeyStr: string = ''
  speacialArr
    .filter(o => o.isSelect)
    .forEach(x => {
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
    genKeyStr = `0${toHexStr(keyValue.value.length)}${genKeyStr}`
  } else {
    userKeyStr = userKeyStr.replace(/\+\s$/, '-> ') + keyValue.value
    genKeyStr = `101${toHexStr(count)}${toHexStr(
      keyValue.value.length
    )}${genKeyStr}`
  }
  console.info(genKeyStr)
  configStore.keyConfig[configStore.curEvent] = {
    userKey: userKeyStr,
    genKey: genKeyStr,
  }
  // console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="comp-key-content">
    <div id="comp-special">
      <div
        v-for="v in speacialArr"
        :key="v.spId"
        :class="{ selected: v.isSelect }"
        @click="changeSelect(v.spId)"
      >
        {{ v.spName }}
      </div>
    </div>
    <div id="key-input-box">
      <input
        type="text"
        v-model="keyValue"
        spellcheck="false"
      />
      <div
        id="commit-box"
        @click="commit"
      >
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
  @include global.ab_center;
  z-index: 66;
  // background: rgba($color: #000000, $alpha: 0.3);
  #comp-special {
    width: 100%;
    height: 70%;
    @include global.style_common(
      35px 35px 0 0,
      rgba($color: #494c54, $alpha: 1)
    );
    @include global.grid_config(repeat(4, 1fr), repeat(2, 1fr), 15px, 16px);
    grid-template-rows: repeat(2, 25%);
    padding: 20px;
    div {
      @include global.style_common(5px, rgba(255, 255, 255, 1));
      @include global.flex_center;
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
    @include global.style_common(
      30px 30px 20px 20px,
      rgba(255, 255, 255, 1),
      null,
      0 0 0 4px rgba(191, 203, 206, 0.6)
    );
    @include global.pos_ab(0, 0, 2);
    @include global.flex_center;
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
      @include global.pos_ab(20px, 20px, 2);
      @include global.style_common(12px, rgba(210, 168, 169, 0.5));
      @include global.flex_center;
      font-size: 20px;
      color: rgba(255, 255, 255, 1);
      cursor: pointer;
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
