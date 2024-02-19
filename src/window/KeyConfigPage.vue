<script setup lang="ts">
import WindowTitle from '../components/tools/WindowTitle.vue'
import PopBox from '../components/tools/PopBox.vue'
import ConfigData from '../components/configPage/ConfigData.vue'
import EventBox from '../components/configPage/EventBox.vue'
import FuncBox from '../components/configPage/FuncBox.vue'
import { ref } from 'vue'

const funcShow = ref<boolean>(true)

const closeFuncBox = (event) => {
  funcShow.value = false
}
</script>

<template>
  <PopBox ref="popBoxRef" />
  <div class="container">
    <WindowTitle>
      <div>KeyConfig</div>
    </WindowTitle>
    <div id="key-config-content">
      <div class="div1">
        <ConfigData />
      </div>
      <div class="div2">
        <EventBox />
      </div>
      <div class="div3">
        <FuncBox />
      </div>
    </div>
    <div id="func-position" v-if="funcShow" @click.stop="closeFuncBox">
      <router-view @click.stop=""></router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#cover {
  width: 98%;
  height: 98%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(51, 51, 51, 0.2);
  border-radius: 15px;
  z-index: 998;
}
.container {
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 6px solid rgba(15, 16, 23, 1);
  border-radius: 2.5em;
  overflow: hidden;
  box-sizing: border-box;
  padding: 10px;
  z-index: 2;
  color: var(--text-color-1);
  // padding-bottom: 12px;
  background-color: #d9c6c6;
  background-image: linear-gradient(135deg, #d9c6c6 0%, #c9e0e5 87%, #cfdcdd 100%);
  padding-bottom: 4em;
  position: relative;
}
#key-config-content {
  width: 100%;
  height: 100%;
  max-width: 950px;
  max-height: 750px;
  margin: 0 auto;
  border-radius: 19px;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(6, 1fr);
  grid-column-gap: 15px;
  grid-row-gap: 16px;
  > div {
    border-radius: 9px;
    background: rgba(114, 106, 109, 0.2);
  }
  .div1 {
    grid-area: 1 / 1 / 4 / 4;
    padding: 15px;
  }
  .div2 {
    grid-area: 4 / 1 / 7 / 4;
    padding: 12px;
    div {
      width: 100%;
      height: 100%;
      // background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
    }
  }
  .div3 {
    grid-area: 1 / 4 / 7 / 6;
    padding: 12px;
  }
}
#func-position {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 66;
  background: rgba( 158, 170, 172, 0.3 );
  backdrop-filter: blur( 2px );
  -webkit-backdrop-filter: blur( 2px );
  border-radius: 10px;
  border: 1px solid rgba( 255, 255, 255, 0.18 );
}
</style>
