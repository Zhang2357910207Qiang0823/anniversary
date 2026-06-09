<template>
  <canvas ref="canvasRef" class="star-canvas"></canvas>
</template>

<script setup>
import { ref } from 'vue'
import { useStarCanvas } from '../composables/useStarCanvas.js'

const canvasRef = ref(null)
useStarCanvas(canvasRef)
</script>

<style scoped>
.star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
