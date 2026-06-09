<template>
  <div class="floating-elements" aria-hidden="true">
    <div
      v-for="el in hearts"
      :key="'h' + el.id"
      class="floating-heart"
      :style="el.style"
    >
      <div class="heart-inner"></div>
    </div>
    <div
      v-for="el in stars"
      :key="'s' + el.id"
      class="floating-star"
      :style="el.style"
    >
      <div class="star-inner">
        <div class="star-vert"></div>
        <div class="star-horiz"></div>
        <div class="star-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

function makeHearts(count) {
  const res = []
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 95 + 2
    const delay = Math.random() * 10
    const duration = 7 + Math.random() * 8
    const size = 18 + Math.random() * 28
    const opacity = 0.15 + Math.random() * 0.35
    res.push({
      id: i,
      style: {
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: `${size}px`,
        height: `${size}px`,
        opacity
      }
    })
  }
  return res
}

function makeStars(count) {
  const res = []
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 95 + 2
    const delay = Math.random() * 8
    const duration = 4 + Math.random() * 6
    const size = 8 + Math.random() * 18
    const opacity = 0.2 + Math.random() * 0.6
    res.push({
      id: i,
      style: {
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        width: `${size}px`,
        height: `${size}px`,
        opacity
      }
    })
  }
  return res
}

const hearts = computed(() => makeHearts(10))
const stars = computed(() => makeStars(14))
</script>

<style scoped>
.floating-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

/* ===== 发光心形 ===== */
.floating-heart {
  position: absolute;
  bottom: -60px;
  animation: float-heart ease-in-out infinite;
}

.heart-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform: rotate(-45deg);
  background: linear-gradient(135deg, rgba(255, 158, 205, 0.5), rgba(177, 156, 217, 0.3));
  border-radius: 4px;
  box-shadow:
    0 0 20px rgba(255, 158, 205, 0.4),
    0 0 40px rgba(255, 158, 205, 0.2),
    0 0 60px rgba(255, 158, 205, 0.1);
}

.heart-inner::before,
.heart-inner::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  box-shadow: inherit;
}

.heart-inner::before {
  top: -50%;
  left: 0;
}

.heart-inner::after {
  top: 0;
  left: 50%;
}

@keyframes float-heart {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(1);
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  40% {
    transform: translateY(-45vh) translateX(25px) rotate(15deg) scale(1.1);
  }
  70% {
    transform: translateY(-75vh) translateX(-15px) rotate(-8deg) scale(0.95);
  }
  95% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-110vh) translateX(10px) rotate(5deg) scale(0.8);
    opacity: 0;
  }
}

/* ===== 发光十字星（菱形交叉，对齐 Canvas 星形） ===== */
.floating-star {
  position: absolute;
  bottom: -30px;
  animation: float-star ease-in-out infinite;
}

.star-inner {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 发光光晕 */
.star-inner::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
  height: 200%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.35) 0%,
    rgba(168, 216, 234, 0.2) 25%,
    rgba(255, 255, 255, 0) 60%
  );
}

/* 竖向菱形臂 */
.star-vert {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 35%;
  height: 100%;
  background: #fff;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
}

/* 横向菱形臂 */
.star-horiz {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 35%;
  background: #fff;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
}

/* 中心亮点 */
.star-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28%;
  height: 28%;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 6px rgba(255, 255, 255, 1),
    0 0 14px rgba(255, 255, 255, 0.7);
}

@keyframes float-star {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translateY(-50vh) translateX(-20px) rotate(45deg);
  }
  90% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-105vh) translateX(15px) rotate(90deg);
    opacity: 0;
  }
}
</style>
