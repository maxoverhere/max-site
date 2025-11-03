import { Link, NavLink } from 'react-router-dom'
import './navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">max-site</Link>
        <nav className="navbar__nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}>Home</NavLink>
          <NavLink to="/games" className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}>Games</NavLink>
          <NavLink to="/tools" className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}>Tools</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}>About</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar


