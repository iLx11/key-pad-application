<script setup lang="ts">

const win = window as any

const createWindow = () => {
  win.myApi.createNewWindow({
    route: '/child1',
  }, {
    width: 300,
    height: 300
  })
}

</script>

<template>
  <div class="container">
    childPage
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
  width: 98%;
  height: 98%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 0.1px solid rgba(173, 171, 171, 0.4);
  border-radius: 16px;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(9, 1fr);
  column-gap: 10px;
  row-gap: 10px;
  box-sizing: border-box;
  padding: 15px;
  z-index: 99;
  // box-shadow: 1.1px 0px 10.8px -34px rgba(0, 0, 0, 0.059), 7px 0px 81px -34px rgba(0, 0, 0, 0.12);
  background: var(--content-box-color);
  color: var(--text-color-1);
  padding-bottom: 12px;
  // -webkit-app-region: drag;


  div {
    border-radius: 12px;
    border: 0.2px solid rgba(51, 51, 51, 0.1);
    z-index: 100;
    box-sizing: border-box;
  }
}

</style>