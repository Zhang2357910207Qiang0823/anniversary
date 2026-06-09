import { ref } from 'vue'
import { store } from '../store/index.js'

const audio = ref(null)
const isPlaying = ref(false)
let initAttempted = false

export function useMusic() {
  function initAudio() {
    if (audio.value) return
    try {
      audio.value = new Audio()
      // 使用本地音乐文件（用户放置到 public/music/ 目录）
      audio.value.src = '/music/bgm.mp3'
      audio.value.loop = true
      audio.value.volume = 0.5
    } catch (e) {
      console.warn('Audio init failed:', e)
    }
  }

  function play() {
    if (!audio.value) initAudio()
    if (!audio.value) return
    audio.value.play().then(() => {
      isPlaying.value = true
      store.isMusicPlaying = true
    }).catch(() => {
      // 浏览器限制自动播放，静默处理
    })
  }

  function pause() {
    if (!audio.value) return
    audio.value.pause()
    isPlaying.value = false
    store.isMusicPlaying = false
  }

  function toggle() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  function tryAutoPlay() {
    if (initAttempted) return
    initAttempted = true
    initAudio()
    play()
  }

  return {
    isPlaying,
    play,
    pause,
    toggle,
    tryAutoPlay,
    initAudio
  }
}
