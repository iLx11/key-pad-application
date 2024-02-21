<script setup lang="ts"></script>

<template>
  <div id="media-key-content">
    <ul>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>

    </ul>
    <div id="commit-box">确认</div>
  </div>
</template>

<style lang="scss" scoped>
#media-key-content {
  width: 60%;
  height: 50%;
  max-width: 600px;
  max-height: 500px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  background: rgba(255, 255, 255, 1);
  border-radius: 12px;
  ul {
    width: 100%;
    height: 100%;
    // margin-right: 10px;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    overflow: scroll;
    padding: 1.5em;
    li {
      width: 25%;
      height: 100px;
      margin: 4.1%;
      border-radius: 12px;
      cursor: pointer;
      background: rgba($color: #494c54, $alpha: 1);
    }
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
</style>
