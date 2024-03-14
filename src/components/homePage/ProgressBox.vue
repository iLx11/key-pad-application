<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useConfigStore } from '../../stores/configStore'

const configStore = useConfigStore()

const progressData = reactive({
  text: '0%',
  top: '100%',
  color: 'rgba(51, 51, 51, 0.7)'
})
watch(
  () => configStore.progressMes,
  () => {
    let begin = configStore.progressMes
    console.info(begin)
    begin > 50 ? (progressData.color = `rgba(255, 255, 255, 0.8)`) : (progressData.color = `rgba(51, 51, 51, 0.7)`)
    progressData.text = `${begin}%`
    if (begin % 10 == 0) progressData.top = `${100 - begin}%`
    if (begin > 100) return
  }, {
    immediate: true
  }
)
</script>

<template>
  <div id="download-cover">
    <div id="download-back">
      <div id="progress-ball">
        <div id="wave-box" :style="{ top: progressData.top }">
          <div class="g-wave"></div>
          <div class="g-wave"></div>
          <div class="g-wave"></div>
        </div>
      </div>
      <div id="progress-text" :style="{ color: progressData.color }">{{ progressData.text }}</div>
      <div id="progress-notice">数据传输中...</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#progress-notice {
  position: absolute;
  bottom: 6%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(51, 51, 51, 0.4);
  word-break: keep-all;
}
#progress-text {
  width: 30px;
  height: 30px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  // color: rgba(51, 51, 51, 0.6);
  transition: all 0.8s ease-in-out;
}
#download-cover {
  width: 100%;
  height: 100%;
  // filter: blur(5px);
  position: absolute;
  top: 0;
  left: 0;
  #download-back {
    width: 75%;
    height: 75%;
    background: rgb(223, 229, 229);
    // filter: blur(5px);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50px;
  }
  #progress-ball {
    width: 220px;
    height: 220px;
    background: rgba(159, 171, 172, 0.8);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    border-radius: 50%;
    box-shadow: 0 14px 28px rgba(33, 150, 243, 0), 0 10px 10px rgba(9, 188, 215, 0.08);
  }
  #wave-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.9s ease-in-out;
  }

  .g-wave {
    position: absolute;
    width: 320px;
    height: 300px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 49% 43% 46% 42%;
    bottom: 25px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 1;
    animation: move 10s linear infinite;
  }

  .g-wave:nth-child(2) {
    width: 340px;
    height: 340px;
    border-radius: 38% 46% 43% 47%;
    transform: translate(-50%, 0) rotate(-175deg);
    background: rgba(255, 255, 255, 0.8);
  }

  .g-wave:nth-child(3) {
    width: 370px;
    height: 370px;
    border-radius: 42% 49% 37% 40%;
    transform: translate(-50%, 0) rotate(135deg);
    background: rgba(255, 255, 255, 0.7);
  }
  // .g-wave {
  //   transform: translate(-50%, -130px) !important;
  // }
  @keyframes move {
    0% {
      transform: translate(-50%, 0px) rotate(0deg);
    }
    100% {
      transform: translate(-50%, 0px) rotate(780deg);
    }
  }
  // translate(-50%, -160px)
}
</style>
