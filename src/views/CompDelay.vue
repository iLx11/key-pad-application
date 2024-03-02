<script setup lang="ts">
const aa = 23

</script>

<template>
  <div id="comp-delay-content">
    <div class="div1">
      <ul>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
    <div class="div2">
      <div id="comp-key-content">
        <div id="comp-special">
          <div>LCtrl</div>
          <div>LShift</div>
          <div>LAlt</div>
          <div>LW/</div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div id="key-input-box">
          <input type="text" />
          <div id="commit-box">添加</div>
        </div>
      </div>
    </div>
    <div class="div3">
      <div id="delay-config-box">
        <div>
          <input type="text" />
        </div>
        <div>s</div>
        <div>
          <input type="text" />
        </div>
        <div>ms</div>
      </div>
      <div id="commit-box">添加</div>
    </div>
    <div class="div4">确认</div>
  </div>
</template>

<style lang="scss" scoped>
#comp-delay-content {
  width: 85%;
  height: 85%;
  max-width: 900px;
  max-height: 700px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 66;
  background: rgb(255, 255, 255);

  overflow: hidden;
  border-radius: 25px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(8, 1fr);
  grid-column-gap: 25px;
  grid-row-gap: 25px;
  .div1 {
    grid-area: 1 / 1 / 9 / 4;
    background: rgba(229, 234, 235, 0.8);
    border-radius: 25px;
    ul {
      width: 100%;
      height: 100%;
      overflow: scroll;
      padding: 1.2em;
      li {
        width: 100%;
        height: 50px;
        border-radius: 12px;
        margin-bottom: 15px;
        background: rgba($color: #494c54, $alpha: 1);
      }
    }
  }
  .div2 {
    grid-area: 1 / 4 / 5 / 8;
  }
  .div3 {
    grid-area: 5 / 4 / 8 / 8;
    position: relative;
  }
  .div4 {
    grid-area: 8 / 4 / 9 / 8;
    background: rgba(210, 168, 169, 0.5);
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: rgba(255, 255, 255, 1);
  }
}

#comp-key-content {
  width: 100%;
  height: 100%;
  // max-width: 600px;
  // max-height: 300px;
  z-index: 66;
  position: relative;
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
    border-radius: 30px 30px 20px 20px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 4px rgba(191, 203, 206, 0.6);
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    input {
      width: 80%;
      height: 50%;
      text-align: center;
      font-size: 40px;
      outline: none;
      border: none;
    }
  }
}
#commit-box {
  width: 90px;
  height: 40px;
  background: rgba(210, 168, 169, 0.5);
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
#delay-config-box {
  width: 100%;
  height: 100%;
  border-radius: 25px;
  background: rgba(191, 203, 206, 0.4);
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  div {
    width: 20%;
    height: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
  }
  div:nth-child(1),
  div:nth-child(3) {
    border-radius: 12px;
    background: rgba($color: #494c54, $alpha: 1);
    input {
      width: 100%;
      height: 100%;
      outline: none;
      border: none;
      background: rgba(255, 255, 255, 0);
      color: rgba(255, 255, 255, 1);
      text-align: center;
    }
  }
}
</style>
