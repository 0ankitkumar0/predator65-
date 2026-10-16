import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">

        {/* Back Button */}
        <button
          type="button"
          className="hero-back-btn"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Yacht Title */}
        <h1>Predator 65 SportFly</h1>

        {/* Rating */}
        <div className="hero-rating">
          ★★★★★
        </div>

        {/* Yacht Description */}
        <p>
          Low, sharp and engineered to command attention,
          the Predator 65 Sportfly is defined by confidence and control.
          <br />
          The SkyHelm™ transforms the upper deck into the open air driving
          experience you crave or a private retreat for sunset drinks.
        </p>

      </div>
    </section>
  );
}

export default Hero;