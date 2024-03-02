<script setup lang="ts">
import { customRef, onMounted, reactive, watch } from 'vue'
import { useConfigStore } from '../../stores/configStore'

const configStore = useConfigStore()

const eventObjArray: Array<object> = [
  {
    eventId: 0,
    eventName: '按下',
    isSelect: true
  },
  {
    eventId: 1,
    eventName: '抬起',
    isSelect: false
  },
  {
    eventId: 2,
    eventName: '左旋',
    isSelect: false
  },
  {
    eventId: 3,
    eventName: '右旋',
    isSelect: false
  },
  {
    eventId: 4,
    eventName: '按下左旋',
    isSelect: false
  },
  {
    eventId: 5,
    eventName: '按下右旋',
    isSelect: false
  }
]

const eventShowArray = reactive<Array<object>>([])
const changeSelect = (k: number) => {
  eventShowArray.forEach((o) => (o.isSelect = false))
  eventShowArray[k].isSelect = true
  configStore.setCurEvent(k)
  // console.info(configStore.curEvent)
}
watch(
  () => configStore.configIndex,
  () => {
    console.log(configStore.configIndex)
    eventShowArray.length = 0
    if (configStore.configIndex > 2) {
      let tempArray: Array<object> = eventObjArray.filter((o) => o.eventId < 2)
      eventShowArray.push(...tempArray)
      return
    }
    eventShowArray.push(...eventObjArray)
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div id="event-box-content">
    <div id="event-box">
      <div v-for="v in eventShowArray" :key="v.eventId" :class="{ select: v.isSelect }" @click="changeSelect(v.eventId)">
        {{ v.eventName }}
        <div class="color-box1" v-if="v.isSelect"></div>
        <div class="color-box2" v-if="v.isSelect"></div>
        <div class="color-box3" v-if="v.isSelect"></div>
      </div>
    </div>
    <div id="commit-box">确认</div>
  </div>
</template>

<style lang="scss" scoped>
#event-box-content {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 15px;
  grid-row-gap: 16px;
  div {
    // background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
  }
  #event-box {
    grid-area: 1 / 1 / 3 / 6;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: minmax(1fr, auto);
    padding: 6px;
    grid-column-gap: 12px;
    grid-row-gap: 12px;
    >div {
      cursor: pointer;
      // background: rgba(43, 48, 57, 0.8);
      background: rgba(43, 48, 57, 0.8);
      color: rgba(255, 255, 255, 0.8);
      font-size: 22px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.4s ease-in-out;
      position: relative;
      overflow: hidden;
    }
    >div:hover {
      background: rgba(255, 255, 255, 0.8);
      color: rgba(43, 48, 57, 0.8);
    }
    .color-box1, .color-box2, .color-box3 {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(156, 159, 218, 0.2);
      position: absolute;
      filter: blur(1.5px);
      transition: all 3s ease-in-out;
    }
    .color-box1 {
      left: -2%;
    }
    .color-box2 {
      width: 60px;
      height: 60px;
      right: 0;
      bottom: 20%;
      background: rgba(235, 163, 146, 0.3);
    }
    .color-box3 {
      width: 70px;
      height: 70px;
      left: 20%;
      top: 30%;
      background: rgba(234, 197, 204, 0.3);
    }
  }
  #commit-box {
    grid-area: 3 / 1 / 4 / 6;
    background: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
  }
}
.select {
  background: rgba(255, 255, 255, 0.8) !important;
  color: rgba(43, 48, 57, 0.8) !important;
}

</style>
