<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { toHexStr } from '../utils/strTools'
import { XBox } from 'ilx1-x-box'

const configStore = useConfigStore()

const mouseArray = reactive([
  {
    eventId: 0,
    eventName: '左键点击',
    isSelect: false,
  },
  {
    eventId: 1,
    eventName: '中键点击',
    isSelect: false,
  },
  {
    eventId: 2,
    eventName: '右键点击',
    isSelect: false,
  },
])

const mouseEvent = reactive({
  mouseLeft: '',
  mouseRight: '',
  mouseUp: '',
  mouseDown: '',
  rollDown: '',
  rollUp: '',
})

watch(
  [() => mouseEvent.mouseLeft, () => mouseEvent.mouseRight, () => mouseEvent.mouseUp, () => mouseEvent.mouseDown, () => mouseEvent.rollDown, () => mouseEvent.rollUp],
  (newVal, oldVal) => {
    for (let key in newVal) {
      if (newVal[key] != oldVal[key]) {
        // 限制数值
        if (newVal[key] > 255) {
          XBox.popMes('输入的值不能大于 255')
          mouseEvent[Object.keys(mouseEvent)[key]] = ''
        }
        // 限制双向
        if (newVal[key] != '') {
          let setKey = Number(key)
          setKey += setKey % 2 == 0 ? 1 : -1
          mouseEvent[Object.keys(mouseEvent)[setKey]] = ''
        }
      }
    }
  },
  {
    deep: true,
  }
)

const mouseKeyArray = [0x01, 0x04, 0x02]

const commit = () => {
  let genKeyStr: string = ''
  let userKeyStr: string = ''
  let mouseKey: number = 0x00

  mouseArray.forEach((o) => {
    if (o.isSelect) {
      mouseKey += mouseKeyArray[o.eventId]
      userKeyStr += `${o.eventName}<br>`
    }
  })
  genKeyStr = `4${toHexStr(mouseKey)}`
  let sign = 0
  const evenStr = ['向左移动', '向右移动', '向上移动', '向下移动','向下滚动', '向上滚动']
  const gen = Object.keys(mouseEvent).reduce((pre, cur, index) => {
    console.info(mouseEvent)
    console.info(cur)
    if(mouseEvent[cur] != '') {
      pre.genkey += `${String(index % 2)}${toHexStr(Number(mouseEvent[cur]))}` 
      pre.userKey += `${evenStr[index]} -> ${mouseEvent[cur]}<br>`
      sign = 1
    }
    if(index % 2) {
      if(sign == 0) {
        pre.genkey += `000`
      }
      sign = 0
    }
    return pre
  }, {
    genkey: '',
    userKey: ''
  })
  genKeyStr += gen.genkey
  userKeyStr += gen.userKey

  configStore.keyConfig[configStore.curEvent] = {
    userKey: userKeyStr,
    genKey: genKeyStr,
  }
  console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="mouse-func-content">
    <div class="div1"></div>
    <div class="div2">
      <input
        type="number"
        placeholder="左"
        v-model.number="mouseEvent.mouseLeft"
      />
    </div>
    <div class="div3">
      <input
        type="number"
        placeholder="右"
        v-model.number="mouseEvent.mouseRight"
      />
    </div>
    <div class="div4">
      <input
        type="number"
        placeholder="下"
        v-model.number="mouseEvent.mouseDown"
      />
    </div>
    <div class="div5">
      <input
        type="number"
        placeholder="上"
        v-model.number="mouseEvent.mouseUp"
      />
    </div>
    <div
      class="div6"
      :class="{ isSelect: mouseArray[0].isSelect }"
      @click="mouseArray[0].isSelect = !mouseArray[0].isSelect"
    >
      {{ mouseArray[0].eventName }}
    </div>
    <div class="div7">
      <input
        type="number"
        placeholder="向上滚动"
        v-model.number="mouseEvent.rollUp"
      />
      <span
        :class="{ isSelect: mouseArray[1].isSelect }"
        @click="mouseArray[1].isSelect = !mouseArray[1].isSelect"
        >{{ mouseArray[1].eventName }}</span
      >
      <input
        type="number"
        placeholder="向下滚动"
        v-model.number="mouseEvent.rollDown"
      />
    </div>
    <div
      class="div8"
      :class="{ isSelect: mouseArray[2].isSelect }"
      @click="mouseArray[2].isSelect = !mouseArray[2].isSelect"
    >
      {{ mouseArray[2].eventName }}
    </div>
    <div
      class="div9"
      @click="commit"
    >
      确认
    </div>
    <!-- <div id="commit-box">确认</div> -->
  </div>
</template>

<style lang="scss" scoped>
.isSelect {
  color: rgb(219, 141, 141) !important;
  @include global.style_common(null, rgba($color: #494c54, $alpha: 1) !important, 2px solid rgba(217, 224, 226, 1));
}
#mouse-func-content {
  @include global.wh(600px, 600px, 600px, 600px);
  @include global.ab_center;
  z-index: 66;
  @include global.style_common(50%, rgba(255, 255, 255, 1));
  @include global.grid_config(repeat(8, 1fr), repeat(8, 1fr), 15px, 16px);
  padding: 25px;
  @include global.font_config(1.4em, rgba(255, 255, 255, 1));
  div {
    @include global.style_common(39px, rgba($color: #494c54, $alpha: 1));
    cursor: pointer;
  }
  input {
    @include global.full_wh;
    background: rgba(255, 255, 255, 0);
    outline: none;
    border: none;
    text-align: center;
    @include global.font_config(35px, rgba(255, 255, 255, 1));
    overflow: hidden !important;
  }

  .div1 {
    grid-area: 2 / 2 / 8 / 8;
    @include global.style_common(50%, rgba(255, 255, 255, 1), null, 0 0 0 2px #494c54);
  }
  .div2 {
    grid-area: 4 / 1 / 6 / 3;
  }
  .div3 {
    grid-area: 4 / 7 / 6 / 9;
  }
  .div4 {
    grid-area: 7 / 4 / 9 / 6;
  }
  .div5 {
    grid-area: 1 / 4 / 3 / 6;
  }
  .div6 {
    grid-area: 3 / 3 / 5 / 4;
    @include global.flex_center;
    text-align: center;
  }
  .div7 {
    grid-area: 3 / 4 / 6 / 6;
    @include global.flex_config(1, space-between);
    overflow: hidden;
    @include global.style_common(null, rgba(255, 255, 255, 1), 1.5px solid #494c54);
    input {
      @include global.wh(100%, 30%);
      background: rgba(255, 255, 255, 1);
      outline: none;
      text-align: center;
      @include global.font_config(18px, rgba(51, 51, 51, 1));
    }
    span {
      @include global.wh(100%, 30%);
      background: rgba($color: #494c54, $alpha: 1);
      color: rgba(255, 255, 255, 1);
      @include global.flex_center;
    }
  }
  .div8 {
    grid-area: 3 / 6 / 5 / 7;
    @include global.flex_center;
    text-align: center;
  }
  .div9 {
    grid-area: 6 / 4 / 7 / 6;
    background: rgba(210, 168, 169, 0.8);
    @include global.flex_center;
    @include global.font_config(20px, rgba(255, 255, 255, 1));
    cursor: pointer;
  }
}
</style>
