<template>
  <div class="year-view">
    <StarBackground />
    <FloatingElements />

    <div class="year-header">
      <button class="back-btn" @click="$router.back()" aria-label="返回">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="year-title-wrap">
        <span class="heart-icon">♡</span>
        <h1 class="year-title">{{ yearTitle }}</h1>
        <span class="heart-icon">♡</span>
      </div>
      <MusicToggle />
    </div>

    <div class="photo-grid" ref="gridRef">
      <div
        v-for="photo in yearPhotos"
        :key="photo.id"
        class="photo-item"
        ref="photoRefs"
      >
        <div class="photo-card" @click="openPhoto(photo)">
          <img
            :data-src="photo.blurUrl"
            class="photo-blur lazy-blur"
            :alt="photo.description"
          />
          <img
            :data-src="photo.thumbUrl"
            :alt="photo.description"
            class="photo-img lazy-img"
            loading="lazy"
          />
          <div class="photo-overlay">
            <span class="photo-date">{{ photo.date }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <MusicToggle class="bottom-music" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StarBackground from '../components/StarBackground.vue'
import FloatingElements from '../components/FloatingElements.vue'
import MusicToggle from '../components/MusicToggle.vue'
import { store } from '../store/index.js'

const route = useRoute()
const router = useRouter()
const gridRef = ref(null)
const { params } = route

const year = computed(() => Number(params.year))
const yearInfo = computed(() => store.getYearInfo(year.value))
const yearTitle = computed(() => yearInfo.value?.title || `${year.value}年`)
const yearPhotos = computed(() => store.getPhotosByYear(year.value))

function openPhoto(photo) {
  router.push({ name: 'photo', params: { id: photo.id } })
}

// 懒加载图片
let observer = null

function setupObserver() {
  if (!gridRef.value) return
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 1. 先加载blur图作为占位
        const blurImg = entry.target.querySelector('.lazy-blur')
        if (blurImg && blurImg.dataset.src) {
          blurImg.src = blurImg.dataset.src
          blurImg.removeAttribute('data-src')
        }
        // 2. 再加载缩略图
        const img = entry.target.querySelector('.lazy-img')
        if (img && img.dataset.src) {
          img.src = img.dataset.src
          img.onload = () => {
            img.classList.add('loaded')
            const blurBg = entry.target.querySelector('.photo-blur')
            if (blurBg) blurBg.style.opacity = '0'
          }
          img.removeAttribute('data-src')
        }
        observer.unobserve(entry.target)
      }
    })
  }, { rootMargin: '200px' })

  const items = gridRef.value.querySelectorAll('.photo-item')
  items.forEach(item => observer.observe(item))
}

onMounted(() => {
  nextTick(setupObserver)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.year-view {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  position: relative;
  background: linear-gradient(160deg, var(--bg-gradient-start), var(--bg-gradient-mid), var(--bg-gradient-end));
}

.year-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  background: linear-gradient(180deg,
    rgba(26, 26, 62, 0.95) 0%,
    rgba(26, 26, 62, 0.6) 80%,
    transparent 100%);
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

.year-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.year-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text-primary);
  text-shadow: 0 0 20px rgba(255, 158, 205, 0.5);
}

.heart-icon {
  font-size: 30px;
  color: var(--accent-pink);
  opacity: 0.7;
}

/* 图片网格 */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px 12px 80px;
  z-index: 2;
  position: relative;
}

.photo-item {
  aspect-ratio: 3 / 4;
}

.photo-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.35);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(255, 158, 205, 0.6),
    0 0 60px rgba(255, 182, 193, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  /* 浅粉底色 + 底部留白 */
  background: #fff0f5;
  padding: 5px 5px 20px 5px;
}

.photo-card:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.photo-blur {
  position: absolute;
  left: 5px;
  top: 5px;
  width: calc(100% - 10px);
  height: calc(100% - 25px);
  object-fit: cover;
  filter: blur(10px);
  transform: scale(1.2);
  transition: opacity 0.5s ease;
  z-index: 0;
  border-radius: 10px;
}

.photo-img {
  position: absolute;
  left: 5px;
  top: 5px;
  width: calc(100% - 10px);
  height: calc(100% - 25px);
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 1;
  border-radius: 10px;
  background: transparent;
}

.photo-img.loaded {
  opacity: 1;
}

.photo-overlay {
  position: absolute;
  bottom: 2px;
  left: 5px;
  right: 5px;
  text-align: center;
  z-index: 2;
}

.photo-date {
  font-size: 9px;
  color: rgba(120, 100, 110, 0.75);
  letter-spacing: 0.5px;
  font-weight: 700;
}

/* 底部音乐条 */
.bottom-bar {
  position: fixed;
  bottom: 24px;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
}

.bottom-music {
  pointer-events: auto;
}
</style>
