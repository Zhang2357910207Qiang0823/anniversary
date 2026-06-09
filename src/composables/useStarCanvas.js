import { ref, onMounted, onUnmounted } from 'vue'

export function useStarCanvas(canvasRef) {
  const stars = []
  let animationId = null

  class Star {
    constructor(canvas, layer) {
      this.canvas = canvas
      this.reset(layer)
    }

    reset(layer) {
      this.layer = layer
      this.x = Math.random() * this.canvas.width
      this.y = Math.random() * this.canvas.height
      switch (layer) {
        case 'far':
          this.radius = Math.random() * 0.8 + 0.3
          this.opacity = Math.random() * 0.3 + 0.15
          this.speed = Math.random() * 0.006 + 0.002
          break
        case 'mid':
          this.radius = Math.random() * 1.2 + 0.5
          this.opacity = Math.random() * 0.5 + 0.25
          this.speed = Math.random() * 0.012 + 0.006
          break
        case 'near':
          this.radius = Math.random() * 2 + 1
          this.opacity = Math.random() * 0.7 + 0.3
          this.speed = Math.random() * 0.02 + 0.01
          break
      }
      this.twinkleSpeed = Math.random() * 0.03 + 0.008
      this.twinkleOffset = Math.random() * Math.PI * 2
      this.driftX = (Math.random() - 0.5) * 0.3
      this.driftY = (Math.random() - 0.5) * 0.2
      this.rotation = Math.random() * Math.PI * 2
      this.rotSpeed = (Math.random() - 0.5) * 0.002
    }

    update(frame) {
      const twinkle = Math.sin(frame * this.twinkleSpeed + this.twinkleOffset) * 0.5 + 0.5
      this.currentOpacity = this.opacity * (0.5 + twinkle * 0.5)
      this.rotation += this.rotSpeed

      if (this.layer === 'near') {
        this.x += this.driftX * 0.1
        this.y += this.driftY * 0.1
      }

      if (this.x < -10) this.x = this.canvas.width + 10
      if (this.x > this.canvas.width + 10) this.x = -10
      if (this.y < -10) this.y = this.canvas.height + 10
      if (this.y > this.canvas.height + 10) this.y = -10
    }

    draw(ctx) {
      ctx.save()
      ctx.translate(this.x, this.y)
      ctx.rotate(this.rotation)
      ctx.globalAlpha = this.currentOpacity

      // 发光外圈
      if (this.layer !== 'far') {
        const glowSize = this.radius * 4
        const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize)
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
        glowGrad.addColorStop(0.3, 'rgba(168, 216, 234, 0.15)')
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = glowGrad
        ctx.beginPath()
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // 四角星（菱形交叉）—— 短粗臂
      ctx.fillStyle = '#ffffff'
      const r = this.radius
      const armLen = this.layer === 'near' ? 2.2 : (this.layer === 'mid' ? 1.8 : 1.5)
      const armWid = this.layer === 'near' ? 0.85 : (this.layer === 'mid' ? 0.7 : 0.55)

      // 竖向菱形
      ctx.beginPath()
      ctx.moveTo(0, -r * armLen)
      ctx.lineTo(r * armWid, 0)
      ctx.lineTo(0, r * armLen)
      ctx.lineTo(-r * armWid, 0)
      ctx.closePath()
      ctx.fill()

      // 横向菱形
      ctx.beginPath()
      ctx.moveTo(-r * armLen, 0)
      ctx.lineTo(0, r * armWid)
      ctx.lineTo(r * armLen, 0)
      ctx.lineTo(0, -r * armWid)
      ctx.closePath()
      ctx.fill()

      // 中心亮点
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }
  }

  function init() {
    if (!canvasRef.value) return
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    createStars(canvas)

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(star => {
        star.update(frame)
        star.draw(ctx)
      })
      frame++
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      stars.length = 0
    }
  }

  function createStars(canvas) {
    stars.length = 0
    for (let i = 0; i < 50; i++) stars.push(new Star(canvas, 'far'))
    for (let i = 0; i < 70; i++) stars.push(new Star(canvas, 'mid'))
    for (let i = 0; i < 30; i++) stars.push(new Star(canvas, 'near'))
  }

  let cleanup = () => {}

  onMounted(() => {
    cleanup = init() || (() => {})
  })

  onUnmounted(() => {
    cleanup()
  })
}
