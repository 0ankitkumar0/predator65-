import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

function LocationIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24"
      fill="none" stroke="#ff7900" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function InteractiveMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: [44.11, 9.91],
      zoom: 10,
      minZoom: 5,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      crossOrigin: true
    }).addTo(map);

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    map.whenReady(() => map.invalidateSize());

    return () => {
      observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fullscreen keyboard and scroll handling
  useEffect(() => {
    if (!isFullscreen) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isFullscreen]);

  return (
    <section className="interactive-map-section">
      <h2>Meeting Point &amp; Pickup</h2>

      <div className="meeting-point-address">
        <LocationIcon />
        <span>Paradise Island Marina, Nassau, Bahamas</span>
      </div>

      <div
        className={`interactive-map-viewer ${isFullscreen ? 'is-fullscreen' : ''}`}
        role={isFullscreen ? 'dialog' : undefined}
        aria-modal={isFullscreen || undefined}
        aria-label={isFullscreen ? 'Fullscreen map' : undefined}
      >
        {isFullscreen && (
          <div className="interactive-map-fullscreen-header">
            <h3>Meeting Point &amp; Pickup</h3>
            <button
              className="interactive-map-close"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen map"
              type="button"
              autoFocus
            >
              ×
            </button>
          </div>
        )}

        <div
          className="interactive-map-container"
          ref={mapContainerRef}
          aria-label="Interactive map"
        />

        <div className="interactive-map-controls">
          <button type="button" title="Zoom In" aria-label="Zoom in"
            onClick={() => mapInstanceRef.current?.zoomIn()}>
            +
          </button>

          <button type="button" title="Zoom Out" aria-label="Zoom out"
            onClick={() => mapInstanceRef.current?.zoomOut()}>
            −
          </button>

          {!isFullscreen && (
            <button type="button" title="Fullscreen" aria-label="Open fullscreen map"
              onClick={() => setIsFullscreen(true)}>
              ⛶
            </button>
          )}
        </div>
      </div>

      <p className="interactive-map-note">
        Hotel pickup is available upon request.
      </p>
    </section>
  );
}

export default InteractiveMap;