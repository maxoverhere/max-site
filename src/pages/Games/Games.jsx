import { Link } from 'react-router-dom'

function Games() {
  return (
    <main className="page">
      <h2>Games</h2>
      <ul className="grid">
        <li className="card">
          <h3>Physics Sandbox</h3>
          <p>Canvas-based physics playground.</p>
          <Link className="btn" to="/projects/physics">Open</Link>
        </li>
        <li className="card">
          <h3>Maze Game</h3>
          <p>Find your path through a generated maze.</p>
          <Link className="btn" to="/projects/maze">Open</Link>
        </li>
      </ul>
    </main>
  )
}

export default Games


