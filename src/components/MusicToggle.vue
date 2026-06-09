<template>
  <button class="music-toggle" :class="{ playing: isPlaying }" @click.stop="toggle" :aria-label="isPlaying ? '暂停音乐' : '播放音乐'">
    <span class="music-icon">
      <svg v-if="isPlaying" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3" fill="currentColor"/>
        <circle cx="18" cy="16" r="3" fill="currentColor"/>
        <line x1="6" y1="3" x2="6" y2="4" stroke-width="1.5"/>
        <line x1="6" y1="21" x2="6" y2="22" stroke-width="1.5"/>
        <line x1="18" y1="3" x2="18" y2="4" stroke-width="1.5"/>
        <line x1="18" y1="19" x2="18" y2="22" stroke-width="1.5"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
        <line x1="23" y1="1" x2="1" y2="23" stroke="currentColor" stroke-width="2" opacity="0.7"/>
      </svg>
    </span>
  </button>
</template>

<script setup>
import { useMusic } from '../composables/useMusic.js'

const { isPlaying, toggle } = useMusic()
</script>

<style scoped>
.music-toggle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(255, 158, 205, 0.3);
  transition: all 0.3s ease;
  z-index: 100;
  color: rgba(255, 255, 255, 0.9);
}

.music-toggle:hover {
  box-shadow: 0 0 25px rgba(255, 158, 205, 0.5);
}

.music-toggle:active {
  transform: scale(0.9);
}

.music-toggle.playing {
  animation: music-glow 2s ease-in-out infinite;
}

.music-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes music-glow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(255, 158, 205, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 158, 205, 0.6), 0 0 50px rgba(177, 156, 217, 0.3);
  }
}
</style>
