
import React from 'react';
import './WhatsIncluded.css';

function IncludedIcon({ type }) {
  const paths = {
    waves: (
      <>
        <path d="M2 6c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
        <path d="M2 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
        <path d="M2 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
      </>
    ),

    camera: (
      <>
        <path d="M3 7h4l2-3h6l2 3h4v13H3V7Z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),

    guide: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
        <path d="M17 5a3 3 0 0 1 0 6" />
        <path d="M19 14a5 5 0 0 1 2 4v2" />
      </>
    ),

    location: (
      <>
        <path d="M12 22s8-6.2 8-13a8 8 0 0 0-16 0c0 6.8 8 13 8 13Z" />
        <circle cx="12" cy="9" r="3" />
      </>
    ),

    wifi: (
      <>
        <path d="M2 8a15 15 0 0 1 20 0" />
        <path d="M5 12a10 10 0 0 1 14 0" />
        <path d="M8 16a5 5 0 0 1 8 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 3" />
      </>
    )
  };

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function WhatsIncluded() {
  const includedItems = [
    { name: 'Snorkeling Gear', icon: 'waves' },
    { name: 'Underwater Camera', icon: 'camera' },
    { name: 'Professional Guide', icon: 'guide' },
    { name: 'Beach Pickup', icon: 'location' },
    { name: 'Safety Equipment', icon: 'wifi' },
    { name: 'Flexible Timing', icon: 'clock' }
  ];

  return (
    <section className="whats-included">
      <h2>What's Included</h2>

      <div className="included-grid">
        {includedItems.map((item) => (
          <div className="included-item" key={item.name}>
            <span className="included-icon">
              <IncludedIcon type={item.icon} />
            </span>

            <span className="included-text">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhatsIncluded;
