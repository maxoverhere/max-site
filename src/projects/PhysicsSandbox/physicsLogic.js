export function stepBouncingBalls(canvas, balls, dt) {
  const width = canvas.width
  const height = canvas.height

  for (const b of balls) {
    b.x += b.vx * dt
    b.y += b.vy * dt

    if (b.x - b.r < 0) {
      b.x = b.r
      b.vx = Math.abs(b.vx)
    } else if (b.x + b.r > width) {
      b.x = width - b.r
      b.vx = -Math.abs(b.vx)
    }

    if (b.y - b.r < 0) {
      b.y = b.r
      b.vy = Math.abs(b.vy)
    } else if (b.y + b.r > height) {
      b.y = height - b.r
      b.vy = -Math.abs(b.vy)
    }
  }
}


