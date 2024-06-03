<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { toHexStr } from "../utils/strTools"
import { useConfigStore } from '../stores/configStore'
import { config } from "process";

const configStore = useConfigStore()

const keyArray = reactive([{"key":0,"word":"CapsLock","hex":"39","isHover":false},{"key":1,"word":"F1","hex":"3A","isHover":false},{"key":2,"word":"F2","hex":"3B","isHover":false},{"key":3,"word":"F3","hex":"3C","isHover":false},{"key":4,"word":"F4","hex":"3D","isHover":false},{"key":5,"word":"F5","hex":"3E","isHover":false},{"key":6,"word":"F6","hex":"3F","isHover":false},{"key":7,"word":"F7","hex":"40","isHover":false},{"key":8,"word":"F8","hex":"41","isHover":false},{"key":9,"word":"F9","hex":"42","isHover":false},{"key":10,"word":"F10","hex":"43","isHover":false},{"key":11,"word":"F11","hex":"44","isHover":false},{"key":12,"word":"F12","hex":"45","isHover":false},{"key":13,"word":"PrintScreen","hex":"46","isHover":false},{"key":14,"word":"ScrollLock","hex":"47","isHover":false},{"key":15,"word":"Pause","hex":"48","isHover":false},{"key":16,"word":"Insert","hex":"49","isHover":false},{"key":17,"word":"Home","hex":"4A","isHover":false},{"key":18,"word":"PageUp","hex":"4B","isHover":false},{"key":19,"word":"DeleteForward","hex":"4C","isHover":false},{"key":20,"word":"End","hex":"4D","isHover":false},{"key":21,"word":"PageDown","hex":"4E","isHover":false},{"key":22,"word":"ArrowRight","hex":"4F","isHover":false},{"key":23,"word":"ArrowLeft","hex":"50","isHover":false},{"key":24,"word":"ArrowDown","hex":"51","isHover":false},{"key":25,"word":"ArrowUp","hex":"52","isHover":false},{"key":26,"word":"NumLock","hex":"53","isHover":false},{"key":27,"word":"Clear","hex":"53","isHover":false}])

const setHover = (index: number) => {
  keyArray[index].isHover = true
}

const resetHover = (index: number) => {
  keyArray[index].isHover = false
}

const commit = (index: number) => {
  let genKeyStr: string = ''
  genKeyStr = `001${keyArray[index].hex}`
  // console.info(genKeyStr)
  configStore.keyConfig[configStore.curEvent] = {
    userKey: keyArray[index].word,
    genKey: genKeyStr
  }
  console.info(configStore.keyConfig[configStore.curEvent])
  configStore.setFuncShow(false)
}
</script>

<template>
  <div id="media-key-content">
    <ul>
      <li v-for="(v, k) in keyArray" :key="v.key" :class="{hover: v.isHover}" @click="commit(k)" @mouseenter="setHover(k)" @mouseleave="resetHover(k)">
        <span>{{ v.word }}</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.hover {
  background: rgba(51, 51, 51, 0.8) !important;
  color: rgba(255, 255, 255, 1) !important;
}
#media-key-content {
  @include wh(80%, 90%, 700px, 500px, 700px);
  @include ab_center;
  z-index: 66;
  @include style_common(25px, rgba($color: #494c54, $alpha: 1));
  ul {
    @include full_wh;
    // margin-right: 10px;
    @include flex_config(0, flex-start, wrap);
    overflow: scroll;
    padding: 1.5em;
    li {
      @include wh(20%, 100px);
      margin: 0.8em;
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
      @include style_common(12px, rgba(255, 255, 255, 1));
      @include flex_center;
      font-size: 20px;
      span {
        text-align: center;
      }
    }
  }
  #commit-box {
    @include wh(120px, 50px);
    @include pos_ab(20px, 20px, 2);
    @include style_common(12px, rgba(210, 168, 169, 1));
    cursor: pointer;
    @include flex_center;
    @include font_config(20px, rgba(255, 255, 255, 1));
  }
}
</style>
