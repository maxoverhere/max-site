 
import { useState, useEffect } from 'react'
import pearImage from '../../assets/images/Pear.png'
import './home.css'

function Home() {
  const [pears, setPears] = useState([])

  useEffect(() => {
    const count = 3
    const newPears = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
      size: 100 + Math.random() * 80,
    }))
    setPears(newPears)
  }, [])

  return (
    <main className="page page--home">
      <section className="hero hero--center">
        <h1 className="hero__title">Welcome to max-site</h1>
        <p className="hero__subtitle lead">Play with ideas, games, and projects — all in one place.</p>
        <div className="hero-floating">
          {pears.map((pear) => (
            <img
              key={pear.id}
              src={pearImage}
              alt=""
              className="floating-pear"
              style={{
                left: `${pear.x}%`,
                top: `${pear.y}%`,
                width: `${pear.size}px`,
                animationDuration: `${pear.duration}s`,
                animationDelay: `${pear.delay}s`,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home


