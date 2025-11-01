import { useEffect, useRef } from 'react'
import { generateMaze, drawMaze } from './mazeLogic'
import './maze.css'

function MazeGame() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const cols = 25
    const rows = 15
    const cell = 28
    canvas.width = cols * cell
    canvas.height = rows * cell

    const maze = generateMaze(cols, rows)
    drawMaze(ctx, maze, cell)
  }, [])

  return (
    <main className="page">
      <h2>Maze Game</h2>
      <canvas ref={canvasRef} className="maze-canvas canvas-surface" />
    </main>
  )
}

export default MazeGame


