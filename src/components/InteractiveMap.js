
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

function LocationIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ff7900"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function InteractiveMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const container = mapContainerRef.current;

    if (!container || mapInstanceRef.current) {
      return;
    }

    // Reference screenshot: La Spezia, Italy
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

    // Free OpenStreetMap tiles - no API key needed
    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        crossOrigin: true
      }
    ).addTo(map);

    // Keep map responsive
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();    //leaflet map container size recheck
    });

    resizeObserver.observe(container);

    // Fix initial map rendering
    map.whenReady(() => {
      map.invalidateSize();  
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <section className="interactive-map-section">
      <h2>Meeting Point &amp; Pickup</h2>

      <div className="meeting-point-address">
        <LocationIcon />

        <span>
          Paradise Island Marina, Nassau, Bahamas
        </span>
      </div>

      <div
        className="interactive-map-container"
        ref={mapContainerRef}
        aria-label="Interactive map showing the reference coastline"
      />

      <p className="interactive-map-note">
        Hotel pickup is available upon request.
      </p>
    </section>
  );
}

export default InteractiveMap;
