<script setup lang="ts">
defineProps<{ values: number[] }>()
</script>

<template>
  <div class="performance-display" aria-label="电脑性能">
    <strong>电脑性能</strong>
    <div v-for="(label, index) in ['CPU', '内存', '磁盘']" :key="label" class="metric">
      <span>{{ label }}</span>
      <progress :value="(values[index] ?? 255) > 100 ? 0 : values[index]" max="100" :aria-label="label" />
      <span>{{ (values[index] ?? 255) > 100 ? '—' : values[index] + '%' }}</span>
    </div>
  </div>
</template>

<style scoped>
.performance-display {
  background: #10212f;
  color: #f0f6fa;
  width: 100%;
  height: 100%;
  aspect-ratio: 320 / 172;
  box-sizing: border-box;
  padding: 5% 6%;
  display: grid;
  gap: 4%;
  text-align: left;
  font-variant-numeric: tabular-nums;
}
.metric { display: grid; grid-template-columns: 28% 1fr 21%; align-items: center; gap: 4%; font-size: .83em; }
.metric span:last-child { text-align: right; }
progress { width: 100%; height: .6em; accent-color: #72e4ce; }
</style>
