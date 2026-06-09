<template>
  <div class="detail-view" @touchstart="onSwipeStart" @touchmove.prevent="onSwipeMove" @touchend="onSwipeEnd">
    <StarBackground />

    <!-- 顶部操作栏 -->
    <div class="detail-header">
      <button class="back-btn" @click="$router.back()" aria-label="返回">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <MusicToggle />
    </div>

    <!-- 滑动容器 -->
    <div
      class="swipe-container"
      :style="{ transform: `translateX(${translateX}px)` }"
    >
      <div
        v-for="(photo, idx) in allPhotos"
        :key="photo.id"
        class="photo-slide"
        :class="{ active: idx === activeIndex }"
      >
        <div class="photo-wrapper">
          <img
            :src="photo.blurUrl"
            class="photo-bg"
            alt=""
          />
          <img
            :src="idx >= activeIndex - 2 && idx <= activeIndex + 2 ? photo.imageUrl : ''"
            :alt="photo.description"
            class="photo-main"
            @load="onImgLoad($event)"
          />
        </div>
        <div class="photo-info" :class="{ hidden: idx !== activeIndex }">
          <p class="info-location">{{ photo.location }}</p>
          <p class="info-date">{{ photo.date }}</p>
          <p class="info-desc" v-if="photo.description">{{ photo.description }}</p>
        </div>
      </div>
    </div>

    <!-- 左右箭头提示 -->
    <div class="swipe-hint left" v-if="canSwipeLeft">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </div>
    <div class="swipe-hint right" v-if="canSwipeRight">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>

    <!-- 页数指示器 -->
    <div class="page-indicator">
      <span v-for="n in allPhotos.length" :key="n"
        class="dot" :class="{ active: n - 1 === activeIndex }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StarBackground from '../components/StarBackground.vue'
import MusicToggle from '../components/MusicToggle.vue'
import { store } from '../store/index.js'

const route = useRoute()

const currentPhoto = computed(() => store.getPhotoById(route.params.id))
const allPhotos = computed(() => {
  if (!currentPhoto.value) return []
  return store.getPhotosByYear(currentPhoto.value.year)
})

const initialIndex = computed(() => {
  return allPhotos.value.findIndex(p => p.id === route.params.id)
})

// 本地翻页索引，脱离路由控制
const activeIndex = ref(0)
let initialized = false

const windowW = ref(window.innerWidth)
const translateX = ref(0)
const isSwiping = ref(false)
const swipeStartX = ref(0)
const swipeMoveX = ref(0)

const canSwipeLeft = computed(() => activeIndex.value > 0)
const canSwipeRight = computed(() => activeIndex.value < allPhotos.value.length - 1)

function syncTranslate() {
  translateX.value = -windowW.value * activeIndex.value
}

function onSwipeStart(e) {
  isSwiping.value = true
  swipeStartX.value = e.touches[0].clientX
  swipeMoveX.value = 0
}

function onSwipeMove(e) {
  if (!isSwiping.value) return
  swipeMoveX.value = e.touches[0].clientX - swipeStartX.value
  translateX.value = -windowW.value * activeIndex.value + swipeMoveX.value
}

function onSwipeEnd() {
  if (!isSwiping.value) return
  isSwiping.value = false
  const threshold = windowW.value * 0.3

  if (swipeMoveX.value > threshold && canSwipeLeft.value) {
    activeIndex.value--
    syncTranslate()
  } else if (swipeMoveX.value < -threshold && canSwipeRight.value) {
    activeIndex.value++
    syncTranslate()
  } else {
    syncTranslate()
  }
  swipeMoveX.value = 0
}

function onImgLoad(e) {
  const blur = e.target.parentElement.querySelector('.photo-bg')
  if (blur) blur.style.opacity = '0'
}

onMounted(() => {
  // 等待 allPhotos 就绪后初始化索引
  const init = () => {
    if (allPhotos.value.length > 0 && initialIndex.value >= 0) {
      activeIndex.value = initialIndex.value
      syncTranslate()
      initialized = true
    } else if (!initialized) {
      requestAnimationFrame(init)
    }
  }
  init()

  window.addEventListener('resize', () => {
    windowW.value = window.innerWidth
    syncTranslate()
  })
})
</script>

<style scoped>
.detail-view {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  background: linear-gradient(160deg, var(--bg-gradient-start), var(--bg-gradient-mid), var(--bg-gradient-end));
  touch-action: pan-y;
}

.detail-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(8px);
}

.back-btn svg {
  width: 22px;
  height: 22px;
}

.swipe-container {
  display: flex;
  height: 100%;
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;
}

.photo-slide {
  min-width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px 120px;
}

.photo-wrapper {
  position: relative;
  width: 100%;
  max-width: 380px;
  aspect-ratio: 3 / 4;
  border-radius: 15px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.35);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(255, 158, 205, 0.6),
    0 0 60px rgba(255, 182, 193, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  background: #fff0f5;
  padding: 15px 15px 25px 15px;
}

.photo-bg {
  position: absolute;
  left: 15px;
  top: 15px;
  width: calc(100% - 30px);
  height: calc(100% - 40px);
  object-fit: cover;
  filter: blur(20px);
  transform: scale(1.2);
  transition: opacity 0.6s ease;
  z-index: 0;
  border-radius: 12px;
}

.photo-main {
  position: absolute;
  left: 15px;
  top: 15px;
  width: calc(100% - 30px);
  height: calc(100% - 40px);
  object-fit: cover;
  z-index: 1;
  background: transparent;
  border-radius: 12px;
}

.photo-info {
  text-align: center;
  margin-top: 20px;
  z-index: 2;
}

.photo-info.hidden {
  visibility: hidden;
}

.info-location {
  font-size: 16px;
  font-weight: 300;
  color: var(--text-primary);
  letter-spacing: 2px;
  text-shadow: 0 0 15px rgba(255, 158, 205, 0.4);
  margin-bottom: 4px;
}

.info-date {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.info-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  max-width: 300px;
}

.swipe-hint {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.4);
  z-index: 10;
  pointer-events: none;
  animation: hint-bounce 2s ease-in-out infinite;
}

.swipe-hint.left { left: 8px; }
.swipe-hint.right { right: 8px; }

.swipe-hint svg {
  width: 100%;
  height: 100%;
}

@keyframes hint-bounce {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}

.page-indicator {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: var(--accent-pink);
  box-shadow: 0 0 8px var(--accent-pink);
  width: 16px;
  border-radius: 3px;
}
</style>
