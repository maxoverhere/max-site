import React, { useEffect, useRef, useState } from "react";
import pearImage from "../../assets/images/Pear.png";
import shoeImage from "../../assets/images/shoe.png";
import motorbikeImage from "../../assets/images/Motorbike.png";
import "./home.css";

const ASSETS = [pearImage, shoeImage, motorbikeImage];
const GAP = 24;
const BASE_SIZE = 80;
const SPEED = 0.6;
const GRAVITY = 0.15;

function makeInitialItems(containerWidth = typeof window !== "undefined" ? window.innerWidth : 1200) {
  const items = [];
  let x = 0;
  let idx = 0;
  while (x < containerWidth + 300) {
    const size = BASE_SIZE + (idx % 3) * 8;
    items.push({
      id: `item-${idx}`,
      image: ASSETS[idx % ASSETS.length],
      size,
      empty: false,
    });
    x += size + GAP;
    idx += 1;
    if (idx > 40) break;
  }
  return items;
}

export default function Home() {
  const [items, setItems] = useState(() => makeInitialItems());
  const [flung, setFlung] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const offsetRef = useRef(0);
  const rafRef = useRef(null);
  const trackRef = useRef(null);
  const itemsRef = useRef(items);
  const itemCounterRef = useRef(items.length);
  const positionHistoryRef = useRef([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const slotWidth = (size) => size + GAP;
  useEffect(() => {
    function step() {
      offsetRef.current += SPEED;

      const currentItems = itemsRef.current;
      
      let removedWidth = 0;
      let currentX = 0;
      const itemsToRemove = [];

      currentItems.forEach((item) => {
        const itemWidth = slotWidth(item.size);
        const itemRight = currentX + offsetRef.current + item.size;

        if (itemRight < -100) {
          itemsToRemove.push(item.id);
          removedWidth += itemWidth;
        }
        currentX += itemWidth;
      });

      if (itemsToRemove.length > 0) {
        offsetRef.current -= removedWidth;
        setItems((prev) => {
          const filtered = prev.filter((it) => !itemsToRemove.includes(it.id));
          itemsRef.current = filtered;
          return filtered;
        });
      }

      const remainingItems = itemsRef.current;
      let totalWidth = 0;
      remainingItems.forEach((item) => {
        totalWidth += slotWidth(item.size);
      });

      const lastItemRight = totalWidth + offsetRef.current;
      if (lastItemRight < window.innerWidth + 300) {
        const counter = itemCounterRef.current++;
        const newItem = {
          id: `item-${counter}`,
          image: ASSETS[counter % ASSETS.length],
          size: BASE_SIZE + (counter % 3) * 8,
          empty: false,
        };
        setItems((prev) => {
          const updated = [...prev, newItem];
          itemsRef.current = updated;
          return updated;
        });
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${-offsetRef.current}px)`;
      }
      setFlung((prev) =>
        prev
          .map((f) => {
            const newVy = f.vy + GRAVITY;
            const nx = f.x + f.vx;
            const ny = f.y + newVy;
            return { ...f, x: nx, y: ny, vx: f.vx, vy: newVy };
          })
          .filter(
            (f) =>
              !(f.y > window.innerHeight + 200 || f.x < -200 || f.x > window.innerWidth + 200)
          )
      );

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    function onPointerMove(e) {
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const now = performance.now();
      
      positionHistoryRef.current.push({ x: clientX, y: clientY, t: now });
      
      if (positionHistoryRef.current.length > 20) {
        positionHistoryRef.current.shift();
      }
      
      setDragPos({ x: clientX, y: clientY });
    }

    function onPointerUp(e) {
      if (!dragging) return;
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const now = performance.now();
      
      const history = positionHistoryRef.current;
      const lookbackTime = 80;
      const targetTime = now - lookbackTime;
      
      let vx = 0;
      let vy = 0;
      
      let bestMatch = null;
      let bestDiff = Infinity;
      
      for (let i = history.length - 1; i >= 0; i--) {
        const diff = Math.abs(history[i].t - targetTime);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestMatch = history[i];
        }
        if (history[i].t < targetTime - 50) break;
      }
      
      if (bestMatch) {
        const dt = Math.max(1, now - bestMatch.t);
        vx = ((clientX - bestMatch.x) / dt) * (1000 / 60);
        vy = ((clientY - bestMatch.y) / dt) * (1000 / 60);
      } else if (history.length > 0) {
        const first = history[0];
        const dt = Math.max(1, now - first.t);
        vx = ((clientX - first.x) / dt) * (1000 / 60);
        vy = ((clientY - first.y) / dt) * (1000 / 60);
      }

      const flingItem = {
        id: `flung-${Date.now()}`,
        image: dragging.image,
        size: dragging.size,
        x: clientX,
        y: clientY,
        vx: vx * 1.6,
        vy: vy * 1.2,
      };
      setFlung((prev) => [...prev, flingItem]);

      setDragging(null);
      setDragPos({ x: 0, y: 0 });
      positionHistoryRef.current = [];
    }

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [dragging]);

  const handleDragStart = (e, item) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const now = performance.now();
    
    positionHistoryRef.current = [{ x: clientX, y: clientY, t: now }];
    
    setDragging(item);
    setDragPos({ x: clientX, y: clientY });
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, empty: true } : it)));
  };

  const refillIfAllEmpty = () => {
    const haveAnyNonEmpty = items.some((it) => !it.empty);
    if (!haveAnyNonEmpty) {
      setItems(makeInitialItems());
    }
  };

  useEffect(() => {
    refillIfAllEmpty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <main className="page page--home">
      <section className="hero hero--center">
        <h1 className="hero__title">Welcome to max-site</h1>
        <p className="hero__subtitle lead">
          Play with ideas, games, and projects — all in one place.
        </p>

        <div className="flung-layer">
          {flung.map((f) => (
            <img
              key={f.id}
              src={f.image}
              alt=""
              className="flung-asset"
              style={{
                width: `${f.size}px`,
                height: `${f.size}px`,
                left: `${f.x - f.size / 2}px`,
                top: `${f.y - f.size / 2}px`,
              }}
            />
          ))}
        </div>

        {dragging && (
          <img
            src={dragging.image}
            alt=""
            className="dragged-asset"
            style={{
              width: `${dragging.size}px`,
              height: `${dragging.size}px`,
              left: `${dragPos.x - dragging.size / 2}px`,
              top: `${dragPos.y - dragging.size / 2}px`,
            }}
          />
        )}

        <div className="banner-viewport">
          <div className="banner-track" ref={trackRef}>
            {items.map((it) => (
              <div
                key={it.id}
                className={`banner-slot ${it.empty ? "empty" : ""}`}
                style={{ width: `${it.size}px`, marginRight: `${GAP}px` }}
              >
                {!it.empty && (
                  <img
                    src={it.image}
                    alt=""
                    draggable={false}
                    className="banner-asset"
                    style={{ width: `${it.size}px`, height: `${it.size}px` }}
                    onMouseDown={(e) => handleDragStart(e, it)}
                    onTouchStart={(e) => handleDragStart(e, it)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
