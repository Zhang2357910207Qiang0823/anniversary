import { ref } from 'vue'

export function useDrag() {
  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const offsetX = ref(0)
  const offsetY = ref(0)
  const velocityX = ref(0)
  const velocityY = ref(0)
  const lastX = ref(0)
  const lastY = ref(0)
  const lastTime = ref(0)
  const animId = ref(null)
  const dragTarget = ref({ x: 0, y: 0 })

  const bounds = { minX: -(window.innerWidth * 1.2), maxX: window.innerWidth * 0.4, minY: -(window.innerHeight * 1.2), maxY: window.innerHeight * 0.4 }

  function onTouchStart(e) {
    if (e.touches.length !== 1) return
    cancelAnimationFrame(animId.value)
    isDragging.value = true
    const touch = e.touches[0]
    startX.value = touch.clientX - offsetX.value
    startY.value = touch.clientY - offsetY.value
    lastX.value = touch.clientX
    lastY.value = touch.clientY
    lastTime.value = Date.now()
  }

  function onTouchMove(e) {
    if (!isDragging.value) return
    const touch = e.touches[0]
    const now = Date.now()
    const dt = now - lastTime.value
    if (dt > 0) {
      velocityX.value = (touch.clientX - lastX.value) / dt
      velocityY.value = (touch.clientY - lastY.value) / dt
    }
    lastX.value = touch.clientX
    lastY.value = touch.clientY
    lastTime.value = now

    let nx = touch.clientX - startX.value
    let ny = touch.clientY - startY.value
    nx = Math.min(bounds.maxX, Math.max(bounds.minX, nx))
    ny = Math.min(bounds.maxY, Math.max(bounds.minY, ny))
    offsetX.value = nx
    offsetY.value = ny
    dragTarget.value = { x: nx, y: ny }
  }

  function onTouchEnd() {
    isDragging.value = false
    const friction = 0.92
    const minVel = 0.05

    const applyInertia = () => {
      if (isDragging.value) return
      if (Math.abs(velocityX.value) < minVel && Math.abs(velocityY.value) < minVel) {
        snapToBounds()
        return
      }

      offsetX.value += velocityX.value * 16
      offsetY.value += velocityY.value * 16
      velocityX.value *= friction
      velocityY.value *= friction

      if (offsetX.value < bounds.minX || offsetX.value > bounds.maxX) velocityX.value *= -0.3
      if (offsetY.value < bounds.minY || offsetY.value > bounds.maxY) velocityY.value *= -0.3
      offsetX.value = Math.min(bounds.maxX, Math.max(bounds.minX, offsetX.value))
      offsetY.value = Math.min(bounds.maxY, Math.max(bounds.minY, offsetY.value))

      dragTarget.value = { x: offsetX.value, y: offsetY.value }
      animId.value = requestAnimationFrame(applyInertia)
    }

    animId.value = requestAnimationFrame(applyInertia)
  }

  function snapToBounds() {
    const overshootX = offsetX.value < bounds.minX ? bounds.minX - offsetX.value : offsetX.value > bounds.maxX ? bounds.maxX - offsetX.value : 0
    const overshootY = offsetY.value < bounds.minY ? bounds.minY - offsetY.value : offsetY.value > bounds.maxY ? bounds.maxY - offsetY.value : 0
    if (Math.abs(overshootX) > 20 || Math.abs(overshootY) > 20) {
      offsetX.value -= overshootX * 0.1
      offsetY.value -= overshootY * 0.1
      dragTarget.value = { x: offsetX.value, y: offsetY.value }
      animId.value = requestAnimationFrame(snapToBounds)
    }
  }

  function setInitialPosition(x, y) {
    offsetX.value = Math.min(bounds.maxX, Math.max(bounds.minX, x))
    offsetY.value = Math.min(bounds.maxY, Math.max(bounds.minY, y))
    dragTarget.value = { x: offsetX.value, y: offsetY.value }
  }

  function cleanup() {
    cancelAnimationFrame(animId.value)
  }

  return {
    dragTarget, isDragging,
    onTouchStart, onTouchMove, onTouchEnd,
    setInitialPosition,
    cleanup
  }
}
