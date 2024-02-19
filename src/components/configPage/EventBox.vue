<script setup lang="ts">

</script>

<template>
  <div id="event-box-content">
    <div id="event-box">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div id="commit-box"></div>
  </div>
</template>

<style lang="scss" scoped>
#event-box-content {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 15px;
  grid-row-gap: 16px;
  div {
    // background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
  }
  #event-box {
    grid-area: 1 / 1 / 3 / 6;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    padding: 6px;
    grid-column-gap: 12px;
    grid-row-gap: 12px;
    div {
      cursor: pointer;
      background: rgba(43, 48, 57, 0.8);
    }
  }
  #commit-box {
    grid-area: 3 / 1 / 4 / 6;
    background: rgba(255, 255, 255, 0.7);
    cursor: pointer;
  }
}
</style>