
import React from 'react';
import './PickupCancellation.css';

function CheckIcon({ color }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 11.5V12a8.5 8.5 0 1 1-4.2-7.34" />
      <path d="m8 11.5 3.3 3.3L21 5" />
    </svg>
  );
}

function PickupCancellation() {
  return (
    <section className="pickup-cancellation-section">

      {/* FREE HOTEL PICKUP */}

      <div className="hotel-pickup-box">
        <div className="notice-title">
          <CheckIcon color="#00a84f" />

          <h3>Free Hotel Pickup Included</h3>
        </div>

        <p>
          We'll pick you up from your hotel lobby 30 minutes
          before tour start time. Pickup is available from
          most Nassau and Paradise Island hotels.
        </p>
      </div>

      {/* CANCELLATION POLICY */}

      <div className="cancellation-policy-section">
        <h2>Cancellation Policy</h2>

        <div className="free-cancellation-box">
          <div className="notice-title">
            <CheckIcon color="#075bff" />

            <h3>Free Cancellation</h3>
          </div>

          <p>
            Cancel up to 24 hours before your tour starts
            for a full refund. Weather cancellations are
            fully refundable.
          </p>
        </div>
      </div>

    </section>
  );
}

export default PickupCancellation;
