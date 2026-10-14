
import React from 'react';

const species = [
  'Blue Marlin',
  'Mahi-Mahi',
  'Yellowfin Tuna',
  'Wahoo',
  'Sailfish',
  'Barracuda',
  'King Mackerel',
  'Snapper'
];

function FishIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ff7900"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 12c3-5 8-6 13-2l2 2-2 2c-5 4-10 3-13-2Z" />
      <path d="m6.5 12-4-4v8l4-4" />
      <circle cx="16" cy="11" r="1" />
      <path d="M10 8 8 5l5 2" />
    </svg>
  );
}

function TargetSpecies() {
  return (
    <section className="target-species">
      <h2>Target Species</h2>

      <div className="species-grid">
        {species.map((fish) => (
          <div className="species-card" key={fish}>
            <FishIcon />
            <span>
              <span style={{fontSize: '13px',fontWeight: 500}}>
                {fish}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TargetSpecies;
