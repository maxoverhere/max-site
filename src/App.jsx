import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'

import Home from './pages/Home/Home'
import Games from './pages/Games/Games'
import About from './pages/About/About'
import Tools from './pages/Tools/Tools'
const PhysicsSandbox = lazy(() => import('./projects/PhysicsSandbox/PhysicsSandbox'))
const MazeGame = lazy(() => import('./projects/MazeGame/MazeGame'))
const ListTool = lazy(() => import('./projects/ListTool/ListTool'))
const PdfTool = lazy(() => import('./projects/PdfTool/PdfTool'))
const PdfEditor = lazy(() => import('./projects/PdfEditor/PdfEditor'))

function App() {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects/physics" element={<PhysicsSandbox />} />
        <Route path="/projects/maze" element={<MazeGame />} />
        <Route path="/projects/list-tool" element={<ListTool />} />
        <Route path="/projects/pdf-tool" element={<PdfTool />} />
        <Route path="/projects/pdf-editor" element={<PdfEditor />} />
      </Routes>
      </Suspense>
    </Router>
  )
}

export default App
