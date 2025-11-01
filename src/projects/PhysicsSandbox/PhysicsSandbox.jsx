import { useEffect, useRef } from 'react'
import { stepBouncingBalls } from './physicsLogic'
import './physics.css'

function PhysicsSandbox() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let last = performance.now()
    let balls = Array.from({ length: 12 }, (_, i) => ({
      x: 60 + i * 40,
      y: 60 + (i % 3) * 30,
      vx: (Math.random() * 2 - 1) * 120,
      vy: (Math.random() * 2 - 1) * 120,
      r: 10 + Math.random() * 10,
    }))

    function frame(t) {
      const dt = Math.min(33, t - last) / 1000
      last = t
      stepBouncingBalls(canvas, balls, dt)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      for (const b of balls) {
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <main className="page">
      <h2>Physics Sandbox</h2>
      <canvas ref={canvasRef} width={900} height={500} className="physics-canvas canvas-surface" />
    </main>
  )
}

export default PhysicsSandbox


