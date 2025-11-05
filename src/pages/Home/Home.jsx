 
import { useState, useEffect, useRef } from 'react'
import pearImage from '../../assets/images/Pear.png'
import shoeImage from '../../assets/images/shoe.png'
import motorbikeImage from '../../assets/images/Motorbike.png'
import './home.css'

const assets = [pearImage, shoeImage, motorbikeImage]

function Home() {
  const [bannerItems, setBannerItems] = useState([])
  const [flungItems, setFlungItems] = useState([])
  const [bannerOffset, setBannerOffset] = useState(0)
  const [draggedItem, setDraggedItem] = useState(null)
  const [draggedItemKey, setDraggedItemKey] = useState(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const lastPosRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(Date.now())
  const bannerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const flungRefs = useRef(new Map())
  const draggedRef = useRef(null)
  const bannerInnerRef = useRef(null)
  const bannerSlotRefs = useRef(new Map())
  const bannerOffsetRef = useRef(0)
  const itemUpdateCounterRef = useRef(0)
  const startTimeRef = useRef(Date.now())
  const scrollSpeedRef = useRef(50)

  useEffect(() => {
    const count = 9
    const newItems = Array.from({ length: count }, (_, i) => ({
      id: `banner-${i}`,
      image: assets[i % assets.length],
      size: 80 + Math.random() * 40,
      empty: false,
    }))
    setBannerItems(newItems)
    startTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const elapsed = (now - startTimeRef.current) / 1000
      bannerOffsetRef.current = -elapsed * scrollSpeedRef.current
      
      if (bannerInnerRef.current) {
        bannerInnerRef.current.style.setProperty('--offset', `${bannerOffsetRef.current}px`)
      }

      itemUpdateCounterRef.current++
      
      if (itemUpdateCounterRef.current >= 5) {
        itemUpdateCounterRef.current = 0
        
        setBannerItems((prev) => {
          const gap = 40
          let currentX = 0
          const itemsToRemove = []

          prev.forEach((item) => {
            const itemWidth = item.size + gap
            const itemRight = currentX + bannerOffsetRef.current + item.size

            if (itemRight < -100) {
              itemsToRemove.push(item.id)
            }
            currentX += itemWidth
          })

          const remainingItems = prev.filter((item) => !itemsToRemove.includes(item.id))
          
          let totalX = 0
          remainingItems.forEach((item) => {
            totalX += item.size + gap
          })
          if (totalX > 0) {
            totalX -= gap
          }

          const newItems = []
          const lastItemRight = totalX + bannerOffsetRef.current
          if (lastItemRight < window.innerWidth + 300) {
            const newItem = {
              id: `banner-${Date.now()}-${Math.random()}`,
              image: assets[Math.floor(Math.random() * assets.length)],
              size: 80 + Math.random() * 40,
              empty: false,
            }
            newItems.push(newItem)
          }

          return remainingItems.concat(newItems)
        })
      }

      setFlungItems((prev) =>
        prev.map((item) => {
          const vx = item.vx * 0.98
          const vy = item.vy + 0.5
          const rx = item.rx + item.rotationSpeed
          const x = item.x + vx
          const y = item.y + vy

          if (x < -100 || x > window.innerWidth + 100 || y > window.innerHeight + 100) {
            return null
          }

          return { ...item, x, y, vx, vy, rx }
        }).filter(Boolean)
      )

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [bannerItems])

  useEffect(() => {
    flungItems.forEach((item) => {
      const el = flungRefs.current.get(item.id)
      if (el) {
        el.style.setProperty('--x', `${item.x}px`)
        el.style.setProperty('--y', `${item.y}px`)
        el.style.setProperty('--size', `${item.size}px`)
        el.style.setProperty('--rotation', `${item.rx}deg`)
      }
    })
  }, [flungItems])

  useEffect(() => {
    if (draggedItem && draggedRef.current) {
      draggedRef.current.style.setProperty('--x', `${dragPosition.x - draggedItem.size / 2}px`)
      draggedRef.current.style.setProperty('--y', `${dragPosition.y - draggedItem.size / 2}px`)
      draggedRef.current.style.setProperty('--size', `${draggedItem.size}px`)
    }
  }, [draggedItem, dragPosition])


  useEffect(() => {
    bannerItems.forEach((item) => {
      const slotRefs = bannerSlotRefs.current.get(item.id)
      if (slotRefs) {
        slotRefs.slot.style.setProperty('--size', `${item.size}px`)
        if (slotRefs.asset) {
          slotRefs.asset.style.setProperty('--size', `${item.size}px`)
        }
      }
      const dupSlotRefs = bannerSlotRefs.current.get(`${item.id}-dup`)
      if (dupSlotRefs) {
        dupSlotRefs.slot.style.setProperty('--size', `${item.size}px`)
        if (dupSlotRefs.asset) {
          dupSlotRefs.asset.style.setProperty('--size', `${item.size}px`)
        }
      }
    })
  }, [bannerItems])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggedItem) return

      const clientX = e.clientX
      const clientY = e.clientY
      const now = Date.now()
      const dt = Math.max(1, now - timeRef.current)

      const vx = (clientX - lastPosRef.current.x) / dt * 16
      const vy = (clientY - lastPosRef.current.y) / dt * 16

      setDragPosition({ x: clientX, y: clientY })
      setVelocity({ x: vx, y: vy })
      lastPosRef.current = { x: clientX, y: clientY }
      timeRef.current = now
    }

    const handleMouseUp = (e) => {
      if (!draggedItem) return

      const clientX = e.clientX
      const clientY = e.clientY

      if (clientY < window.innerHeight - 200) {
        setFlungItems((prev) => [
          ...prev,
          {
            ...draggedItem,
            id: `flung-${Date.now()}-${Math.random()}`,
            x: clientX,
            y: clientY,
            vx: velocity.x * 2,
            vy: velocity.y * 2,
            rx: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
          },
        ])

        if (draggedItemKey && draggedItem) {
          setBannerItems((prev) =>
            prev.map((item) => {
              if (item.id === draggedItem.id) {
                return { ...item, empty: true }
              }
              return item
            })
          )
        }
      }

      setDraggedItem(null)
      setDraggedItemKey(null)
      setVelocity({ x: 0, y: 0 })
    }

    const handleTouchMove = (e) => {
      if (!draggedItem) return
      e.preventDefault()

      const clientX = e.touches[0].clientX
      const clientY = e.touches[0].clientY
      const now = Date.now()
      const dt = Math.max(1, now - timeRef.current)

      const vx = (clientX - lastPosRef.current.x) / dt * 16
      const vy = (clientY - lastPosRef.current.y) / dt * 16

      setDragPosition({ x: clientX, y: clientY })
      setVelocity({ x: vx, y: vy })
      lastPosRef.current = { x: clientX, y: clientY }
      timeRef.current = now
    }

    const handleTouchEnd = (e) => {
      if (!draggedItem) return

      const clientX = e.changedTouches[0].clientX
      const clientY = e.changedTouches[0].clientY

      if (clientY < window.innerHeight - 200) {
        setFlungItems((prev) => [
          ...prev,
          {
            ...draggedItem,
            id: `flung-${Date.now()}-${Math.random()}`,
            x: clientX,
            y: clientY,
            vx: velocity.x * 2,
            vy: velocity.y * 2,
            rx: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
          },
        ])

        if (draggedItemKey && draggedItem) {
          setBannerItems((prev) =>
            prev.map((item) => {
              if (item.id === draggedItem.id) {
                return { ...item, empty: true }
              }
              return item
            })
          )
        }
      }

      setDraggedItem(null)
      setDraggedItemKey(null)
      setVelocity({ x: 0, y: 0 })
    }

    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [draggedItem, velocity])

  const handleDragStart = (e, item, itemKey) => {
    e.preventDefault()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    setDraggedItem(item)
    setDraggedItemKey(itemKey)
    setDragPosition({ x: clientX, y: clientY })
    lastPosRef.current = { x: clientX, y: clientY }
    timeRef.current = Date.now()
    setVelocity({ x: 0, y: 0 })
  }

  return (
    <main className="page page--home">
      <section className="hero hero--center">
        <h1 className="hero__title">Welcome to max-site</h1>
        <p className="hero__subtitle lead">Play with ideas, games, and projects — all in one place.</p>
        
        <div className="flung-container">
          {flungItems.map((item) => (
            <img
              key={item.id}
              ref={(el) => {
                if (el) {
                  flungRefs.current.set(item.id, el)
                } else {
                  flungRefs.current.delete(item.id)
                }
              }}
              src={item.image}
              alt=""
              className="flung-asset"
            />
          ))}
        </div>

        {draggedItem && (
          <img
            ref={draggedRef}
            src={draggedItem.image}
            alt=""
            className="dragged-asset"
          />
        )}

        <div className="banner-container" ref={bannerRef}>
          <div className="banner" ref={bannerInnerRef}>
            {bannerItems.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) {
                    const existing = bannerSlotRefs.current.get(item.id) || {}
                    bannerSlotRefs.current.set(item.id, { ...existing, slot: el })
                  }
                }}
                className="banner-slot"
              >
                {!item.empty && (
                  <img
                    ref={(el) => {
                      if (el) {
                        const existing = bannerSlotRefs.current.get(item.id) || {}
                        bannerSlotRefs.current.set(item.id, { ...existing, asset: el })
                      }
                    }}
                    src={item.image}
                    alt=""
                    className="banner-asset"
                    draggable={false}
                    onMouseDown={(e) => handleDragStart(e, item, item.id)}
                    onTouchStart={(e) => handleDragStart(e, item, item.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home


