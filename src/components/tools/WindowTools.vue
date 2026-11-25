<script setup lang="ts">
const win = window as any
defineProps<{ fixedSize?: boolean }>()
const emit = defineEmits<{ (event: 'before-close'): void }>()

function closeWindow() {
  emit('before-close')
  win.myApi.closeWindow()
}
</script>

<template>
  <div class="window-tools" role="group" aria-label="窗口控制">
    <button class="minimize" type="button" title="最小化" aria-label="最小化"
      @click="win.myApi.minimizeWindow()"></button>
    <button v-if="!fixedSize" class="maximize" type="button" title="最大化或还原" aria-label="最大化或还原"
      @click="win.myApi.maximizeWindow()"></button>
    <button class="close" type="button" title="关闭" aria-label="关闭" @click="closeWindow"></button>
  </div>
</template>

<style scoped>
.window-tools {
  display: flex;
  flex: none;
  gap: 4px;
  -webkit-app-region: no-drag;
}

button {
  position: relative;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #1f353d;
  cursor: pointer;
}

button:hover {
  background: #e7eeec;
}

button:focus-visible {
  outline: 2px solid #164d64;
  outline-offset: 1px;
}

button::before, .close::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 11px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.maximize::before {
  width: 9px;
  height: 9px;
  border: 1.5px solid currentColor;
  background: transparent;
}

.close:hover {
  background: #a6303a;
  color: #fff;
}

.close::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.close::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
</style>
