<script setup lang="ts">
import WindowTools from '../components/WindowTools.vue'
import WindowTitle from '../components/WindowTitle.vue'
import { onMounted, nextTick, ref, watch } from 'vue'
import PopBox from '../components/PopBox.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const win = window as any

const createWindow = () => {
  console.log(router)
  console.log(router.currentRoute.value.path)
  win.myApi.createNewWindow(
    {
      route: '/child'
    },
    {
      width: 500,
      height: 500
    }
  )
}
</script>

<template>
  <PopBox ref="popBoxRef" />
  <div class="container" @click="createWindow">
    <WindowTitle>
      <div>HomePage</div>
    </WindowTitle>
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
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 0.1px solid rgba(173, 171, 171, 0.4);
  border-radius: 16px;
  overflow: hidden;

  box-sizing: border-box;
  padding: 10px;
  z-index: 2;
  // box-shadow: 1.1px 0px 10.8px -34px rgba(0, 0, 0, 0.059), 7px 0px 81px -34px rgba(0, 0, 0, 0.12);
  background: var(--content-box-color);
  color: var(--text-color-1);
  padding-bottom: 12px;
  // -webkit-app-region: drag;
}
</style>
