<script setup lang="ts">
import WindowTools from '../components/tools/WindowTools.vue'
import WindowTitle from '../components/tools/WindowTitle.vue'
import { onMounted, nextTick, ref, watch } from 'vue'
import PopBox from '../components/tools/PopBox.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const win = window as any

onMounted(() => {
  createWindow()
})
const createWindow = () => {
  // console.log(router)
  // console.log(router.currentRoute.value.path)
  win.myApi.createNewWindow(
    {
      route: '/config'
    },
    {
      width: 800,
      height: 600
    }
  )
}
</script>

<template>
  <PopBox ref="popBoxRef" />
  <div class="container">
    <WindowTitle>
      <div>MuiltKey</div>
    </WindowTitle>
    <div id="home-cotent">
      <div class="div1">
        <div></div>
        <div></div>
      </div>
      <div class="div2">
        <div class="div5">
          <div></div>
        </div>
        <div class="div6">
          <div></div>
        </div>
        <div class="div7">
          <div></div>
        </div>
        <div class="div8"></div>
      </div>
      <div class="div3">
        <div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div class="div4"></div>
    </div>
  </div>
</template>

<style lang="scss">
#cover {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(51, 51, 51, 0.2);
  border-radius: 15px;
  z-index: 998;
}

.container {
  width: 95%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-52%, -50%);
  border: 10px solid rgba(15, 16, 23, 1);
  border-radius: 4em;
  // overflow: hidden;
  box-sizing: border-box;
  padding: 10px;
  z-index: 2;
  color: var(--text-color-1);
  padding-bottom: 12px;
  background-color: #e5eae9;
  background-image: linear-gradient(20deg, #e5eae9 0%, #8f9d9f 100%);

  // -webkit-app-region: drag;
}

#home-cotent {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  // background: rgba($color: #000000, $alpha: 1.0);
  // position: absolute;
}
.div1 {
  grid-area: 1 / 1 / 3 / 2;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
  div {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    background: rgba(12, 14, 20, 1);
    cursor: pointer;
  }
}
.div2 {
  grid-area: 1 / 2 / 3 / 8;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  padding-bottom: 20px;
  padding-left: 10px;
  div {
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
  }
  .div5 { 
    grid-area: 1 / 1 / 4 / 4;
    div {
      width: 200px;
      height: 108px;
      margin: 10px auto;
    }
  }
  .div6 { 
    grid-area: 1 / 4 / 3 / 6;
    div {
      width: 120px;
      height: 66px;
      margin: 10px auto;
    }
   }
  .div7 { 
    grid-area: 1 / 6 / 3 / 8;
    div {
      width: 120px;
      height: 66px;
      margin: 10px auto;
    }
   }
  .div8 { grid-area: 3 / 4 / 4 / 8; }
}
.div3 {
  grid-area: 3 / 1 / 6 / 6;
  // background: rgba($color: #000000, $alpha: 0.4);
  margin-bottom: 20px;

  > div {
    width: 100%;
    height: 210px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 15px;
    grid-row-gap: 15px;
    // background: rgba($color: #000000, $alpha: 0.4);
    background-color: #cfaaac;
    background-image: linear-gradient(62deg, #cfaaac 0%, #a9b7c0 100%);
    border-radius: 12px;
    div {
      cursor: pointer;
      border-radius: 12px;
      background: rgba($color: #000000, $alpha: 0.4);
    }
  }
}
.div4 {
  grid-area: 3 / 6 / 6 / 8;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background: rgba(12, 14, 20, 1);
  position: fixed;
  right: -40px;
  bottom: 20px;
  cursor: pointer;
}
</style>
