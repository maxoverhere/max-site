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
  const lastItemSlotRef = useRef(null);
  const draggingRef = useRef(null);
  const draggedElementRef = useRef(null);
  const captureTargetRef = useRef(null);
  const flungRef = useRef([]);

  const handlePointerDown = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget;
    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId);
      captureTargetRef.current = target;
    }
    
    const now = performance.now();
    positionHistoryRef.current = [{ x: e.clientX, y: e.clientY, t: now }];
    
    draggingRef.current = item;
    setDragging(item);
    setDragPos({ x: e.clientX, y: e.clientY });
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, empty: true } : it)));
  };

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    flungRef.current = flung;
  }, [flung]);

  useEffect(() => {
    function step() {
      offsetRef.current += SPEED;

      removeOffScreenItems();
      addNewItemsIfNeeded();
      updateBannerTransform();
      updateFlungPhysics();

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    function onPointerMove(e) {
      const currentDragging = draggingRef.current;
      if (!currentDragging) return;
      
      e.preventDefault();
      const now = performance.now();

      positionHistoryRef.current.push({ x: e.clientX, y: e.clientY, t: now });

      if (positionHistoryRef.current.length > 20) {
        positionHistoryRef.current.shift();
      }

      if (draggedElementRef.current) {
        const size = currentDragging.size;
        draggedElementRef.current.style.transform = `translate(${e.clientX - size / 2}px, ${e.clientY - size / 2}px)`;
      }
    }

    function onPointerUp(e) {
      const currentDragging = draggingRef.current;
      if (!currentDragging) return;
      
      e.preventDefault();
      const now = performance.now();

      const { vx, vy } = calculateVelocity(e.clientX, e.clientY, now);

      const flingItem = {
        id: `flung-${Date.now()}`,
        image: currentDragging.image,
        size: currentDragging.size,
        x: e.clientX,
        y: e.clientY,
        vx: vx * 1.6,
        vy: vy * 1.2,
      };
      setFlung((prev) => [...prev, flingItem]);

      draggingRef.current = null;
      setDragging(null);
      setDragPos({ x: 0, y: 0 });
      positionHistoryRef.current = [];
      
      if (captureTargetRef.current?.releasePointerCapture) {
        captureTargetRef.current.releasePointerCapture(e.pointerId);
        captureTargetRef.current = null;
      }
    }

    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp, { passive: false });
    document.addEventListener("pointercancel", onPointerUp, { passive: false });

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  const slotWidth = (size) => size + GAP;

  const removeOffScreenItems = () => {
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
  };

  const createNewItem = () => {
    const counter = itemCounterRef.current++;
    return {
      id: `item-${counter}`,
      image: ASSETS[counter % ASSETS.length],
      size: BASE_SIZE + (counter % 3) * 8,
      empty: false,
    };
  };

  const addNewItemsIfNeeded = () => {
    if (!lastItemSlotRef.current) return;
    const rect = lastItemSlotRef.current.getBoundingClientRect();
    const lastItemRightOnScreen = rect.right;
    const threshold = window.innerWidth + 300;

    if (lastItemRightOnScreen < threshold) {
      const newItem = createNewItem();
      setItems((prev) => {
        const updated = [...prev, newItem];
        itemsRef.current = updated;
        return updated;
      });
    }
  };

  const updateFlungPhysics = () => {
    const currentFlung = flungRef.current;
    if (currentFlung.length === 0) return;
    
    const updated = currentFlung
      .map((f) => {
        const newVy = f.vy + GRAVITY;
        const nx = f.x + f.vx;
        const ny = f.y + newVy;
        return { ...f, x: nx, y: ny, vx: f.vx, vy: newVy };
      })
      .filter(
        (f) =>
          !(f.y > window.innerHeight + 200 || f.x < -200 || f.x > window.innerWidth + 200)
      );
    
    setFlung(updated);
  };

  const updateBannerTransform = () => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${-offsetRef.current}px)`;
    }
  };

  const calculateVelocity = (currentX, currentY, currentTime) => {
    const history = positionHistoryRef.current;
    const lookbackTime = 80;
    const targetTime = currentTime - lookbackTime;

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
      const dt = Math.max(1, currentTime - bestMatch.t);
      const vx = ((currentX - bestMatch.x) / dt) * (1000 / 60);
      const vy = ((currentY - bestMatch.y) / dt) * (1000 / 60);
      return { vx, vy };
    } else if (history.length > 0) {
      const first = history[0];
      const dt = Math.max(1, currentTime - first.t);
      const vx = ((currentX - first.x) / dt) * (1000 / 60);
      const vy = ((currentY - first.y) / dt) * (1000 / 60);
      return { vx, vy };
    }

    return { vx: 0, vy: 0 };
  };

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
                transform: `translate(${f.x - f.size / 2}px, ${f.y - f.size / 2}px)`,
              }}
            />
          ))}
        </div>

        {dragging && (
          <img
            ref={draggedElementRef}
            src={dragging.image}
            alt=""
            className="dragged-asset"
            style={{
              width: `${dragging.size}px`,
              height: `${dragging.size}px`,
              transform: `translate(${dragPos.x - dragging.size / 2}px, ${dragPos.y - dragging.size / 2}px)`,
            }}
          />
        )}

        <div className="banner-viewport">
          <div className="banner-track" ref={trackRef}>
            {items.map((it, index) => (
              <div
                key={it.id}
                ref={index === items.length - 1 ? lastItemSlotRef : null}
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
                    onPointerDown={(e) => handlePointerDown(e, it)}
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
