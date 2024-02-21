<script setup lang="ts"></script>

<template>
  <div id="mouse-func-content">
    <div class="div1"></div>
    <div class="div2">
      <input type="text" placeholder="左"/>
    </div>
    <div class="div3">
      <input type="text" placeholder="右"/>
    </div>
    <div class="div4">
      <input type="text" placeholder="下"/>
    </div>
    <div class="div5">
      <input type="text" placeholder="上"/>
    </div>
    <div class="div6">左键</div>
    <div class="div7">
      <input type="text" />中键
      <input type="text" />
    </div>
    <div class="div8">右键</div>
    <div class="div9">确认</div>
    <!-- <div id="commit-box">确认</div> -->
  </div>
</template>

<style lang="scss" scoped>
#mouse-func-content {
  width: 500px;
  height: 500px;
  max-width: 600px;
  max-height: 600px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  background: rgba(255, 255, 255, 1);
  border-radius: 50%;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  grid-column-gap: 15px;
  grid-row-gap: 16px;
  padding: 25px;
  color: rgba(255, 255, 255, 1);
  font-size: 1.4em;
  div {
    border-radius: 12px;
    background: rgba($color: #494c54, $alpha: 1);
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
  .div1 {
    grid-area: 2 / 2 / 8 / 8;
    background: rgba(255, 255, 255, 1);
    border-radius: 50%;
    box-shadow: 0 0 0 2px #494c54;
  }
  .div2 {
    grid-area: 4 / 1 / 6 / 3;
  }
  .div3 {
    grid-area: 4 / 7 / 6 / 9;
  }
  .div4 {
    grid-area: 7 / 4 / 9 / 6;
  }
  .div5 {
    grid-area: 1 / 4 / 3 / 6;
  }
  .div6 {
    grid-area: 3 / 3 / 5 / 4;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .div7 {
    grid-area: 3 / 4 / 6 / 6;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    border: 1.5px solid #494c54;
    input {
      width: 100%;
      height: 30%;
      background: rgba(255, 255, 255, 1);
      outline: none;
      text-align: center;
      font-size: 25px;
      color: rgba(51, 51, 51, 1);
    }
  }
  .div8 {
    grid-area: 3 / 6 / 5 / 7;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .div9 {
    grid-area: 6 / 4 / 7 / 6;
    background: rgba(210, 168, 169, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: rgba(255, 255, 255, 1);
    cursor: pointer;
  }
}
</style>
