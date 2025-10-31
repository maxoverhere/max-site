import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

import Home from './pages/Home/Home'
import Games from './pages/Games/Games'
import About from './pages/About/About'
import PhysicsSandbox from './pages/Projects/PhysicsSandbox/PhysicsSandbox'
import MazeGame from './pages/Projects/MazeGame/MazeGame'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects/physics" element={<PhysicsSandbox />} />
        <Route path="/projects/maze" element={<MazeGame />} />
      </Routes>
    </Router>
  )
}

export default App
