<script setup lang="ts"></script>

<template>
  <div id="comp-key-content">
    <div id="comp-special">
      <div>LCtrl</div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div id="key-input-box">
      <input type="text" />
      <div id="commit-box">
        确认
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#comp-key-content {
  width: 60%;
  height: 50%;
  max-width: 600px;
  max-height: 300px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  // background: rgba($color: #000000, $alpha: 0.3);
  #comp-special {
    width: 100%;
    height: 70%;
    border-radius: 35px 35px 0 0;
    background: rgba($color: #494c54, $alpha: 1);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 25%);
    padding: 20px;
    grid-column-gap: 15px;
    grid-row-gap: 16px;
    div {
      border-radius: 5px;
      background: rgba(255, 255, 255, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
  #key-input-box {
    width: 100%;
    height: 55%;
    border-radius: 30px 30px 12px 12px;
    background: rgba(255, 255, 255, 1);
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    input {
      width: 80%;
      height: 50%;
      text-align: center;
      font-size: 45px;
      outline: none;
      border: none;
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
