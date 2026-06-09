<template>
  <div
    class="home-view"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
  >
    <StarBackground />
    <FloatingElements />

    <div class="drag-canvas" :style="canvasStyle">
      <div
        v-for="(year, index) in store.years"
        :key="year.id"
        class="year-stack"
        :class="{ selected: selectedId === year.id }"
        :style="getCardPosition(index)"
        @click.stop="selectYear(year)"
      >
        <!-- 堆叠的层叠卡片 - 3D 照片堆叠效果 -->
        <div class="stack-card" v-for="n in 5" :key="n"
          :style="getStackStyle(n, index)"
        >
          <div class="card-photo">
            <img
              v-if="n === 1 && year.coverThumb"
              :src="year.coverThumb"
              class="card-photo-img"
              loading="lazy"
              draggable="false"
            />
          </div>
        </div>
        <div class="year-label">
          <span class="year-num">{{ year.year }}</span>
          <span class="year-title">{{ year.title.split('·')[1]?.trim() || '' }}</span>
        </div>
      </div>
    </div>

    <div class="top-bar">
      <h1 class="app-title">星空相册</h1>
      <MusicToggle />
    </div>

    <div class="home-hint" v-if="!hasInteracted">
      <span>滑动探索 · 点击年份</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import StarBackground from '../components/StarBackground.vue'
import FloatingElements from '../components/FloatingElements.vue'
import MusicToggle from '../components/MusicToggle.vue'
import { useDrag } from '../composables/useDrag.js'
import { useMusic } from '../composables/useMusic.js'
import { store } from '../store/index.js'

const router = useRouter()
const { dragTarget, onTouchStart, onTouchMove, onTouchEnd, setInitialPosition, cleanup } = useDrag()
const { tryAutoPlay } = useMusic()
const selectedId = ref(null)
const hasInteracted = ref(false)
let clickTimer = null

const canvasStyle = computed(() => ({
  transform: `translate(${dragTarget.value.x}px, ${dragTarget.value.y}px)`
}))

// 为每张卡片生成固定的偏移种子（保证每次渲染一致）
const seedMap = {}
function getSeed(index) {
  if (!seedMap[index]) {
    seedMap[index] = {
      rotX: (Math.random() - 0.5) * 30,
      rotY: (Math.random() - 0.5) * 20,
      rotZ: (Math.random() - 0.5) * 10,
      offsetX: (Math.random() - 0.5) * 30,
      offsetY: (Math.random() - 0.5) * 20,
      hue: (index * 32) % 360 // 每年不同色相，11年均匀分布
    }
  }
  return seedMap[index]
}

function getStackStyle(n, index) {
  const seed = getSeed(index)
  const layerOffset = (n - 1)
  const rotX = seed.rotX + (n - 3) * 8
  const rotY = seed.rotY + (n - 3) * 6
  const rotZ = seed.rotZ + (n - 3) * 3
  const tx = seed.offsetX + layerOffset * 3
  const ty = layerOffset * 3
  const brightness = 1 - layerOffset * 0.1
  const opacity = 1 - layerOffset * 0.15

  // 每个年份不同颜色，堆叠内5层同色
  const h = seed.hue

  // n>1 内收边缘（clip-path），保留背景但不超出顶层范围
  const bg = `linear-gradient(135deg, hsla(${h}, 30%, 85%, 0.55), hsla(${h + 10}, 35%, 75%, 0.6))`

  const clip = n > 1 ? `inset(${3 + layerOffset * 0.8}px round 12px)` : 'none'

  const borderColor = n === 1
    ? 'rgba(255,255,255,0.3)'
    : `hsla(${h}, 40%, 80%, ${0.12 + layerOffset * 0.04})`

  return {
    transform: `
      rotateX(${rotX}deg)
      rotateY(${rotY}deg)
      rotateZ(${rotZ}deg)
      translateX(${tx}px)
      translateY(${ty}px)
      translateZ(${-layerOffset * 8}px)
    `,
    filter: `brightness(${brightness})`,
    opacity: opacity,
    zIndex: 5 - n,
    background: bg,
    borderColor: borderColor,
    clipPath: clip
  }
}

// 紧凑集群布局 —— 所有卡片在 1.25×1.35 视口内可见
function getCardPosition(index) {
  const total = store.years.length
  const vw = window.innerWidth
  const vh = window.innerHeight
  const canvasW = vw * 1.25
  const canvasH = vh * 1.35

  // 三列布局 + 轻微正弦偏移
  const cols = 3
  const rows = Math.ceil(total / cols)
  const colW = canvasW / (cols + 1)
  const rowH = canvasH / (rows + 1)

  const col = index % cols
  const row = Math.floor(index / cols)

  const ox = Math.sin(index * 2.3 + 0.8) * 4
  const oy = Math.cos(index * 1.9 + 0.3) * 5

  return {
    left: `${colW * (col + 1) + ox}px`,
    top: `${rowH * (row + 1) + oy}px`
  }
}

function selectYear(year) {
  hasInteracted.value = true

  if (selectedId.value === year.id) {
    clearTimeout(clickTimer)
    router.push({ name: 'year', params: { year: year.year } })
    selectedId.value = null
    return
  }

  clearTimeout(clickTimer)
  selectedId.value = year.id
  clickTimer = setTimeout(() => {
    selectedId.value = null
  }, 3000)
}

onMounted(() => {
  tryAutoPlay()
  // 计算卡片群中心，初始偏移使所有卡片在视口内可见
  const positions = store.years.map((_, i) => {
    const pos = getCardPosition(i)
    return { x: parseFloat(pos.left), y: parseFloat(pos.top) }
  })
  const minX = Math.min(...positions.map(p => p.x))
  const maxX = Math.max(...positions.map(p => p.x))
  const minY = Math.min(...positions.map(p => p.y))
  const maxY = Math.max(...positions.map(p => p.y))
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const vw = window.innerWidth
  const vh = window.innerHeight
  setInitialPosition(vw / 2 - centerX, vh / 2 - centerY)
})

onUnmounted(() => {
  cleanup()
  clearTimeout(clickTimer)
})
</script>

<style scoped>
.home-view {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  background: linear-gradient(160deg, #0d0d2b 0%, #1a1a4e 25%, #3d1a6e 55%, #6a2d7a 75%, #b84a8e 90%, #ff9ecd 100%);
  touch-action: none;
}

.drag-canvas {
  position: absolute;
  width: 300vw;
  height: 300vh;
  top: 0;
  left: 0;
  will-change: transform;
  z-index: 2;
  perspective: 1200px;
}

.year-stack {
  position: absolute;
  width: 110px;
  height: 150px;
  cursor: pointer;
  transform: translate(-50%, -50%);
  /* 不设置 transition，避免 filter/z-index 变化产生视觉偏移 */
  z-index: 1;
  transform-style: preserve-3d;
}

.year-stack.selected {
  z-index: 100;
}

.year-stack.selected .stack-card {
  box-shadow:
    0 0 30px rgba(255, 158, 205, 0.6),
    0 0 60px rgba(255, 158, 205, 0.3),
    0 0 100px rgba(255, 158, 205, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 158, 205, 0.8);
}

.stack-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(255, 158, 205, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: box-shadow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: auto;
  overflow: hidden;
  transform-style: preserve-3d;
}

/* 照片模拟纹理 */
.card-photo {
  position: absolute;
  inset: 8px;
  border-radius: 8px;
  background: linear-gradient(
    160deg,
    rgba(255, 200, 220, 0.15) 0%,
    rgba(180, 150, 200, 0.1) 30%,
    rgba(100, 80, 140, 0.15) 60%,
    rgba(60, 40, 90, 0.2) 100%
  );
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
}

.card-photo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  opacity: 0.9;
}

.year-label {
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 20;
  pointer-events: none;
  /* preserve-3d 上下文中 z-index 无效，用 translateZ 确保文字在最前面 */
  transform: translateZ(5px);
}

.year-num {
  display: block;
  font-size: 19px;
  /* font-weight: 700; */
  letter-spacing: 3px;
  color: #fff;
  text-shadow:
    0 0 8px rgba(0, 0, 0, 0.7),
    0 0 16px rgba(0, 0, 0, 0.5),
    0 0 10px rgba(255, 158, 205, 0.8),
    0 0 30px rgba(255, 158, 205, 0.4);
}

.year-title {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  margin-top: 1px;
  letter-spacing: 1.5px;
  text-shadow:
    0 0 6px rgba(0, 0, 0, 0.7),
    0 0 12px rgba(0, 0, 0, 0.5),
    0 0 10px rgba(255, 158, 205, 0.3);
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 18px;
  font-weight: 300;
  color: #fff;
  letter-spacing: 5px;
  text-shadow:
    0 0 10px rgba(255, 158, 205, 0.5),
    0 0 30px rgba(255, 158, 205, 0.2);
}

.home-hint {
  position: fixed;
  bottom: 50px;
  width: 100%;
  text-align: center;
  z-index: 50;
  pointer-events: none;
}

.home-hint span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 2px;
  animation: hint-pulse 3s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.6; }
}
</style>
