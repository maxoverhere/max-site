export function generateMaze(cols, rows) {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ visited: false, walls: [true, true, true, true] }))
  )

  function neighbors(c, r) {
    return [
      [c, r - 1, 0, 2],
      [c + 1, r, 1, 3],
      [c, r + 1, 2, 0],
      [c - 1, r, 3, 1],
    ].filter(([x, y]) => x >= 0 && x < cols && y >= 0 && y < rows)
  }

  const stack = [[0, 0]]
  grid[0][0].visited = true

  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1]
    const unvisited = neighbors(cx, cy).filter(([nx, ny]) => !grid[ny][nx].visited)
    if (unvisited.length === 0) {
      stack.pop()
      continue
    }
    const [nx, ny, wallFrom, wallTo] = unvisited[Math.floor(Math.random() * unvisited.length)]
    grid[cy][cx].walls[wallFrom] = false
    grid[ny][nx].walls[wallTo] = false
    grid[ny][nx].visited = true
    stack.push([nx, ny])
  }

  return grid
}

export function drawMaze(ctx, grid, cell) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const px = x * cell
      const py = y * cell
      const walls = grid[y][x].walls
      ctx.beginPath()
      if (walls[0]) { ctx.moveTo(px, py); ctx.lineTo(px + cell, py) }
      if (walls[1]) { ctx.moveTo(px + cell, py); ctx.lineTo(px + cell, py + cell) }
      if (walls[2]) { ctx.moveTo(px + cell, py + cell); ctx.lineTo(px, py + cell) }
      if (walls[3]) { ctx.moveTo(px, py + cell); ctx.lineTo(px, py) }
      ctx.stroke()
    }
  }
}


