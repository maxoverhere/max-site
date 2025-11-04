import { Link } from 'react-router-dom'

function Tools() {
  return (
    <main className="page">
      <h2>Tools</h2>
      <ul className="grid">
        <li className="card">
          <h3>List Tool</h3>
          <p>Compare two lists, sort alphabetically, and highlight diffs.</p>
          <Link className="btn" to="/projects/list-tool">Open</Link>
        </li>
        <li className="card">
          <h3>PDF Tool</h3>
          <p>Merge PDFs or extract a page range (e.g., 2-5).</p>
          <Link className="btn" to="/projects/pdf-tool">Open</Link>
        </li>
      </ul>
    </main>
  )
}

export default Tools


