import React, { useEffect, useRef, useState } from "react";
import pearImage from "../../assets/images/Pear.png";
import shoeImage from "../../assets/images/shoe.png";
import motorbikeImage from "../../assets/images/Motorbike.png";
import "./home.css";

const ASSETS = [pearImage, shoeImage, motorbikeImage];
const GAP = 24; // px space between slots
const BASE_SIZE = 80; // base item size
const SPEED = 0.6; // px per frame (adjust for overall scroll speed)
const GRAVITY = 0.15; // px per frame^2 for flung items

function makeInitialItems(containerWidth = typeof window !== "undefined" ? window.innerWidth : 1200) {
  // deterministic-ish sizes (no wild randomness)
  const items = [];
  let x = 0;
  let idx = 0;
  while (x < containerWidth + 300) {
    const size = BASE_SIZE + (idx % 3) * 8; // small size variation
    items.push({
      id: `item-${idx}`,
      image: ASSETS[idx % ASSETS.length],
      size,
      empty: false,
    });
    x += size + GAP;
    idx += 1;
    // cap just in case
    if (idx > 40) break;
  }
  return items;
}

export default function Home() {
  const [items, setItems] = useState(() => makeInitialItems());
  const [flung, setFlung] = useState([]); // { id, image, size, x, y, vx, vy }
  const [dragging, setDragging] = useState(null); // { id, image, size }
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  const offsetRef = useRef(0); // translateX offset (positive -> content moved left)
  const rafRef = useRef(null);
  const lastMouseRef = useRef({ x: 0, y: 0, t: 0 });
  const trackRef = useRef(null);
  const itemsRef = useRef(items);
  const itemCounterRef = useRef(items.length);

  // keep itemsRef in sync with items state
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // helper: compute width of a slot (size + gap)
  const slotWidth = (size) => size + GAP;

  // --- ticker animation (infinite loop) ---
  useEffect(() => {
    function step() {
      offsetRef.current += SPEED;

      const currentItems = itemsRef.current;
      
      // Remove items that have scrolled off the left side
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

      // Remove off-screen items and adjust offset
      if (itemsToRemove.length > 0) {
        offsetRef.current -= removedWidth;
        setItems((prev) => {
          const filtered = prev.filter((it) => !itemsToRemove.includes(it.id));
          itemsRef.current = filtered;
          return filtered;
        });
      }

      // Calculate total width of remaining items
      const remainingItems = itemsRef.current;
      let totalWidth = 0;
      remainingItems.forEach((item) => {
        totalWidth += slotWidth(item.size);
      });

      // Add new items if needed to fill the screen
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

      // apply the transform
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${-offsetRef.current}px)`;
      }

      // update flung physics
      setFlung((prev) =>
        prev
          .map((f) => {
          
            const newVy = f.vy + GRAVITY;
            const nx = f.x + f.vx;
            const ny = f.y + newVy;
            return { ...f, x: nx, y: ny, vx: newVx, vy: newVy };
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

  // --- pointer handling for drag / fling ---
  useEffect(() => {
    function onPointerMove(e) {
      if (!dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const now = performance.now();
      lastMouseRef.current = { x: clientX, y: clientY, t: now };
      setDragPos({ x: clientX, y: clientY });
    }

    function onPointerUp(e) {
      if (!dragging) return;
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const now = performance.now();
      const last = lastMouseRef.current;
      const dt = Math.max(1, now - (last.t || now));
      // Calculate velocity in pixels per frame (assuming ~60fps, so dt is in ms)
      const vx = ((clientX - (last.x || clientX)) / dt) * (1000 / 60);
      const vy = ((clientY - (last.y || clientY)) / dt) * (1000 / 60);

      // spawn flung item using pointer pos and velocity
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

  // start dragging
  const handleDragStart = (e, item) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMouseRef.current = { x: clientX, y: clientY, t: performance.now() };
    setDragging(item);
    setDragPos({ x: clientX, y: clientY });
    // immediately mark the slot as empty
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, empty: true } : it)));
  };

  // simple reset: if you want to repopulate removed slots you could implement that here
  const refillIfAllEmpty = () => {
    const haveAnyNonEmpty = items.some((it) => !it.empty);
    if (!haveAnyNonEmpty) {
      // reset deterministic items
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

        {/* flung floating assets */}
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

        {/* dragged image (follows cursor) */}
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

        {/* ticker */}
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
                {/* empty slots intentionally leave space */}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
