<script setup lang="ts">


</script>

<template>
  <div id="send-text-content">
      <textarea name="" id="" cols="30" rows="10"></textarea>
      <div id="commit-box">
        确认
      </div>
      <div id="text-limit">
        <span>sdfdf</span>/100
      </div>
  </div>
</template>

<style lang="scss" scoped>
#send-text-content {
  width: 60%;
  height: 40%;
  max-width: 600px;
  max-height: 300px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  // background: rgba($color: #000000, $alpha: 0.3);
  background: rgba(255, 255, 255, 1);
  overflow: hidden;
  border-radius: 16px;
  padding: 3.5em;

    textarea {
      width: 100%;
      height: 100%;
      font-size: 20px;
      outline: none;
      border: none;
      background: rgba(255, 255, 255, 0);
    }
    #commit-box {
      width: 120px;
      height: 50px;
      background: rgba(210, 168, 169, 0.8);
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
    #text-limit {
      width: 120px;
      height: 50px;
      position: absolute;
      right: 20px;
      top: 6px;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
    }
  }
</style>
