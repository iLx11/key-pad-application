<script setup lang="ts">

</script>

<template>
  <div id="file-path-content">
    <div id="file-text">
      选择文件或应用路径
    </div>
    <div id="key-input-box">
      <div id="file-path-show">file://xxxx/xxxxxx/xxxx/xx</div>
      <div id="commit-box">
        确认
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#file-path-content {
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
  #file-text {
    width: 100%;
    height: 60%;
    border-radius: 35px 35px 0 0;
    background: rgba($color: #494c54, $alpha: 1);
    color: rgba(255, 255, 255, 1);
    padding: 1.2em;
    font-size: 20px;
  }
  #key-input-box {
    width: 100%;
    height: 70%;
    border-radius: 30px 30px 12px 12px;
    background: rgba(255, 255, 255, 1);
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    #file-path-show {
      width: 80%;
      height: 50%;
      font-size: 35px;
      word-break: break-all;
      cursor: pointer;
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
  }
}
</style>
