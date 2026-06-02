"use client";

import { useRef } from "react";

export default function PublicCarousel({ items, renderItem, itemKey, label }) {
  const trackRef = useRef(null);

  if (!items?.length) return null;

  function mover(direccion) {
    const track = trackRef.current;

    if (!track) return;

    const distancia = track.clientWidth;
    track.scrollBy({
      left: direccion * distancia,
      behavior: "smooth",
    });
  }

  return (
    <div className="public-carousel" aria-label={label}>
      <div className="public-carousel-controls">
        <button
          type="button"
          className="btn btn-outline-primary public-carousel-btn"
          onClick={() => mover(-1)}
          aria-label={`Anterior ${label || ""}`}
        >
          ‹
        </button>
        <button
          type="button"
          className="btn btn-outline-primary public-carousel-btn"
          onClick={() => mover(1)}
          aria-label={`Siguiente ${label || ""}`}
        >
          ›
        </button>
      </div>
      <div className="public-carousel-track" ref={trackRef}>
        {items.map((item, index) => (
          <div
            className="public-carousel-slide"
            key={itemKey ? itemKey(item) : index}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
