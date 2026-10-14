
import React, { useRef, useState } from 'react';
import './RecommendedYachts.css';

const yachts = [
    { id: 1, name: 'Princess S72', price: '€1,120' },
    { id: 2, name: 'Princess S72', price: '€1,120' },
    { id: 3, name: 'Princess S72', price: '€1,120' },
    { id: 4, name: 'Princess S72', price: '€1,120' },
    { id: 5, name: 'Princess S72', price: '€1,120' }
];

function GuestIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="7" r="3" />
            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
        </svg>
    );
}

function CabinIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 21V3h12v18" />
            <path d="M4 21h16" />
            <path d="M14 12h.01" strokeWidth="3" />
        </svg>
    );
}

function BathIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18v3a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3Z" />
            <path d="M5 12V6a3 3 0 0 1 6 0" />
            <path d="M6 21v1M18 21v1" />
        </svg>
    );
}

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

function YachtCard({ yacht, favorite, onFavorite }) {
    return (
        <article className="rec-yacht-card">
            <div className="rec-yacht-image-wrap">
                <img
                    src="/images/princess-s72-reference.jpg"
                    alt={yacht.name}
                    className="rec-yacht-image"
                    draggable="false"
                />

                <button
                    className={
                        favorite
                            ? 'rec-favorite is-favorite'
                            : 'rec-favorite'
                    }
                    type="button"
                    aria-label={
                        favorite
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                    }
                    aria-pressed={favorite}
                    onClick={() => onFavorite(yacht.id)}
                >
                    {favorite && <HeartIcon />}
                </button>
            </div>

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

            <div className="rec-card-price">
                <span>FROM</span>{' '}
                <strong>{yacht.price} P/W</strong>
            </div>

            <div className="rec-card-location">
                <span className="rec-italy-flag" aria-label="Italy">
                    <i></i>
                    <i></i>
                    <i></i>
                </span>

                <span>PORTISCO, ITALY</span>
            </div>

            <div className="rec-card-features">
                <div className="rec-feature">
                    <GuestIcon />
                    <span>8 + 2</span>
                </div>

                <div className="rec-feature">
                    <CabinIcon />
                    <span>4 + 2</span>
                </div>

                <div className="rec-feature">
                    <BathIcon />
                    <span>4 + 2</span>
                </div>
            </div>
        </article>
    );
}

function RecommendedYachts() {
    const [favorites, setFavorites] = useState([]);
    const trackRef = useRef(null);

    const dragRef = useRef({
        active: false,
        startX: 0,
        scrollLeft: 0
    });

    const toggleFavorite = (id) => {
        setFavorites((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };

    const startDrag = (event) => {
        if (event.button !== 0) return;

        if (event.target.closest('button, a')) {
            return;
        }

        const track = trackRef.current;
        if (!track) return;

        dragRef.current = {
            active: true,
            startX: event.pageX,
            scrollLeft: track.scrollLeft
        };
    };

    const moveDrag = (event) => {
        if (!dragRef.current.active) return;

        const track = trackRef.current;
        if (!track) return;

        event.preventDefault();

        const distance =
            event.pageX - dragRef.current.startX;

        track.scrollLeft =
            dragRef.current.scrollLeft - distance;
    };

    const endDrag = () => {
        dragRef.current.active = false;
    };

    const handleKeyDown = (event) => {
        if (!trackRef.current) return;

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            trackRef.current.scrollBy({
                left: 388,
                behavior: 'smooth'
            });
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            trackRef.current.scrollBy({
                left: -388,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="recommended-yachts-section">
            <div
                className="recommended-yachts-track"
                ref={trackRef}
                tabIndex={0}
                aria-label="Recommended yachts carousel"
                onMouseDown={startDrag}
                onMouseMove={moveDrag}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
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

            <div className="rec-contact-banner">
                <p>
                    Need more details, Dont Worry!
                    <a href="mailto:?subject=Yacht%20Charter%20Enquiry">
                        Get In Touch.
                    </a>
                </p>
            </div>
        </section>
    );
}

export default RecommendedYachts;
