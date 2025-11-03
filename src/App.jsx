import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

import Home from './pages/Home/Home'
import Games from './pages/Games/Games'
import About from './pages/About/About'
import Tools from './pages/Tools/Tools'
import PhysicsSandbox from './projects/PhysicsSandbox/PhysicsSandbox'
import MazeGame from './projects/MazeGame/MazeGame'
import ListTool from './projects/ListTool/ListTool'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects/physics" element={<PhysicsSandbox />} />
        <Route path="/projects/maze" element={<MazeGame />} />
        <Route path="/projects/list-tool" element={<ListTool />} />
      </Routes>
    </Router>
  )
}

export default App
