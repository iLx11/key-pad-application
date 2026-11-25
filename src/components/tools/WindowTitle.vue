<script setup lang="ts">
import WindowTools from './WindowTools.vue'

defineProps<{ fixedSize?: boolean }>()
const emit = defineEmits<{ (event: 'before-close'): void }>()
</script>

<template>
  <div class="top-title">
    <div class="title-content">
      <slot name="title"></slot>
    </div>
    <WindowTools :fixed-size="fixedSize" @before-close="emit('before-close')" />
  </div>
</template>

<style lang="scss" scoped>
.top-title {
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px 6px 14px;
  font-size: 18px;
  font-weight: 600;
  -webkit-app-region: drag;
  color: #17272d;
}

.title-content {
  flex: 1;
  min-width: 0;
}
</style>
