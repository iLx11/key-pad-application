<script setup lang="ts"></script>

<template>
  <div id="menu-func-content">
    <div>《-</div>
    <div>
      <input type="text">
    </div>
    <div>-》</div>
    <div id="commit-box">确认</div>
  </div>
</template>

<style lang="scss" scoped>
#menu-func-content {
  width: 60%;
  height: 30%;
  max-width: 1200px;
  max-height: 600px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  background: rgba(255, 255, 255, 1);
  border-radius: 12px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 25px;
  color: rgba(255, 255, 255, 1);
  font-size: 1.4em;
  div {
    width: 25%;
    height: 60%;
    border-radius: 12px;
    background: rgba($color: #494c54, $alpha: 1);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  input {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0);
    outline: none;
    border: none;
    text-align: center;
    font-size: 35px;
    color: rgba(255, 255, 255, 1);
  }
  #commit-box {
    width: 90px;
    height: 40px;
    background: rgba(210, 168, 169, 0.5);
    position: absolute;
    right: 20px;
    bottom: 12px;
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
