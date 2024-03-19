<script setup lang="ts">
import WindowTitle from '../components/tools/WindowTitle.vue'
import PopBox from '../components/tools/PopBox.vue'
import ScreenEditor from '../components/screenPage/screenEditor.vue'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { useRouter } from 'vue-router'

const win = window as any
const router = useRouter()

</script>

<template>
  <PopBox ref="popBoxRef" />
  <div class="container">
    <WindowTitle>
      <template #title>
        ScreenEditor
      </template>
    </WindowTitle>
    <div id="key-config-content">
      <ScreenEditor />
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
  border-radius: 25px;
  overflow: hidden;
  > div {
    border-radius: 9px;
    background: rgba(114, 106, 109, 0.2);
  } 
}
</style>
