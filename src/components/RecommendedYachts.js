
import React, { useRef, useState } from 'react';
import './RecommendedYachts.css';

// 1. YACHT DATA
// Create five yacht cards using the same demo details.
const yachts = [1, 2, 3, 4, 5].map((id) => ({
  id,
  name: 'Princess S72',
  price: '€1,120'
}));

// Yacht features displayed at the bottom of each card.
const features = [
  { type: 'guest', value: '8 + 2' },
  { type: 'cabin', value: '4 + 2' },
  { type: 'bath', value: '4 + 2' }
];

// 2. FEATURE ICONS
// Display a different SVG icon based on the feature type.
function FeatureIcon({ type }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={type === 'guest' ? 2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {type === 'guest' && (
        <>
          <circle cx="12" cy="7" r="3" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
        </>
      )}

      {type === 'cabin' && (
        <>
          <path d="M6 21V3h12v18" />
          <path d="M4 21h16" />
          <path d="M14 12h.01" strokeWidth="3" />
        </>
      )}

      {type === 'bath' && (
        <>
          <path d="M3 12h18v3a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3Z" />
          <path d="M5 12V6a3 3 0 0 1 6 0" />
          <path d="M6 21v1M18 21v1" />
        </>
      )}
    </svg>
  );
}

// 3. HEART ICON
// This icon appears when a yacht is added to favorites.
function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5
        2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
        C13.59 3.81 15.26 3 17 3c3.08 0 5.5 2.42 5.5 5.5
        0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
    </svg>
  );
}

// 4. YACHT CARD
// Display the image, name, rating, price, location and features.
function YachtCard({ yacht, favorite, onFavorite }) {
  return (
    <article className="rec-yacht-card">

      {/* Yacht image and favorite button */}
      <div className="rec-yacht-image-wrap">
        <img
          src="/images/princess-s72-reference.jpg"
          alt={yacht.name}
          className="rec-yacht-image"
          draggable="false"
        />

        <button
          type="button"
          className={`rec-favorite ${favorite ? 'is-favorite' : ''}`}
          aria-label={
            favorite ? 'Remove from favorites' : 'Add to favorites'
          }
          aria-pressed={favorite}
          onClick={() => onFavorite(yacht.id)}
        >
          {favorite && <HeartIcon />}
        </button>
      </div>

      {/* Yacht name and star rating */}
      <div className="rec-card-heading">
        <h3>{yacht.name}</h3>

        <div
          className="rec-card-rating"
          aria-label="4 out of 5 stars"
        >
          <span>★★★★</span>
          <span className="rec-empty-star">★</span>
        </div>
      </div>

      {/* Yacht price */}
      <div className="rec-card-price">
        <span>FROM</span>{' '}
        <strong>{yacht.price} P/W</strong>
      </div>

      {/* Yacht location */}
      <div className="rec-card-location">
        <span
          className="rec-italy-flag"
          aria-label="Italy"
        >
          <i></i>
          <i></i>
          <i></i>
        </span>

        <span>PORTISCO, ITALY</span>
      </div>

      {/* Guest, cabin and bathroom details */}
      <div className="rec-card-features">
        {features.map((item) => (
          <div className="rec-feature" key={item.type}>
            <FeatureIcon type={item.type} />
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

// 5. MAIN COMPONENT
// Manage yacht favorites and carousel interactions.
function RecommendedYachts() {

  // Store the IDs of favorite yachts.
  const [favorites, setFavorites] = useState([]);

  // Store a reference to the carousel element.
  const trackRef = useRef(null);

  // Store the mouse position during dragging.
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0
  });

  // 6. FAVORITE FUNCTION
  // Add or remove a yacht from favorites.
  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  // 7. MOUSE DRAGGING
  // Save the starting position when dragging begins.
  function startDrag(event) {
    if (event.button !== 0) return;
    if (event.target.closest('button, a')) return;

    const track = trackRef.current;
    if (!track) return;

    dragRef.current = {
      active: true,
      startX: event.pageX,
      scrollLeft: track.scrollLeft
    };
  }

  // Move the carousel when the mouse is dragged.
  function moveDrag(event) {
    if (!dragRef.current.active || !trackRef.current) return;

    event.preventDefault();

    const distance = event.pageX - dragRef.current.startX;

    trackRef.current.scrollLeft =
      dragRef.current.scrollLeft - distance;
  }

  // Stop dragging when the mouse is released.
  function stopDrag() {
    dragRef.current.active = false;
  }

  // 8. KEYBOARD NAVIGATION
  // Scroll using the left and right arrow keys.
  function handleKeyDown(event) {
    let direction = 0;

    if (event.key === 'ArrowRight') direction = 1;
    if (event.key === 'ArrowLeft') direction = -1;

    if (direction === 0 || !trackRef.current) return;

    event.preventDefault();

    trackRef.current.scrollBy({
      left: direction * 388,
      behavior: 'smooth'
    });
  }

  // 9. RENDER COMPONENT
  return (
    <section className="recommended-yachts-section">

      {/* Horizontal yacht carousel */}
      <div
        className="recommended-yachts-track"
        ref={trackRef}
        tabIndex={0}
        aria-label="Recommended yachts carousel"
        onMouseDown={startDrag}
        onMouseMove={moveDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onKeyDown={handleKeyDown}
      >
        {yachts.map((yacht) => (
          <YachtCard
            key={yacht.id}
            yacht={yacht}
            favorite={favorites.includes(yacht.id)}
            onFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Contact information banner */}
      <div className="rec-contact-banner">
        <p>
          Need more details, Dont Worry!{' '}
          <a href="mailto:?subject=Yacht%20Charter%20Enquiry">
            Get In Touch.
          </a>
        </p>
      </div>

    </section>
  );
}

export default RecommendedYachts;
