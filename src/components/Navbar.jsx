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
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}>About</NavLink>
          <div className="nav__dropdown">
            <span className="nav__link">Projects ▾</span>
            <div className="nav__menu">
              <NavLink to="/projects/physics" className={({ isActive }) => isActive ? 'nav__menu-item active' : 'nav__menu-item'}>Physics Sandbox</NavLink>
              <NavLink to="/projects/maze" className={({ isActive }) => isActive ? 'nav__menu-item active' : 'nav__menu-item'}>Maze Game</NavLink>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar


