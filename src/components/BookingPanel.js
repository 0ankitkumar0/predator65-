
import React, { useState } from 'react';

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

const WEEKDAYS = [
  'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
];

const MAY_PRICES = {
  7: 1346,
  8: 1500,
  9: 1346,
  12: 1346,
  13: 1346,
  14: 1346,
  15: 1500,
  16: 1346,
  17: 1346,
  18: 1346,
  19: 1346,
  20: 1346,
  21: 1346,
  29: 1346
};

const PACKAGES = [
  {
    id: 'half',
    name: 'Half-Day Charter',
    description: 'Basic equipment • Bait & tackle',
    price: 230
  },
  {
    id: 'full',
    name: 'Full-Day Adventure',
    description: 'Premium equipment • All bait & tackle',
    price: 280,
    popular: true
  },
  {
    id: 'extended',
    name: 'Extended Deep Sea',
    description: 'Top-tier equipment • Premium bait',
    price: 350
  }
];

const TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM'
];

// Icons

function PencilIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        marginRight: '5px'
      }}
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        marginRight: '5px',
        flexShrink: 0
      }}
      aria-hidden="true"
    >
      <path d="M20 11.1V12a8 8 0 1 1-4.7-7.3" />
      <path d="m8.5 11.5 3 3 8-8" />
    </svg>
  );
}

// Helper functions

function pad(number) {
  return String(number).padStart(2, '0');
}

function formatDate(date) {
  const [year, month, day] = date.split('-').map(Number);

  return `${pad(day)} ${MONTHS[month - 1]
    .slice(0, 3)
    .toUpperCase()} ${year}`;
}

function getCalendarDays(year, month) {
  // Match the initial reference calendar layout.
  if (year === 2021 && month === 4) {
    return [
      {
        day: 28,
        current: false,
        key: 'previous-28'
      },
      ...Array.from({ length: 30 }, (_, index) => ({
        day: index + 1,
        current: true,
        key: `may-${index + 1}`
      })),
      ...Array.from({ length: 4 }, (_, index) => ({
        day: index + 1,
        current: false,
        key: `next-${index + 1}`
      }))
    ];
  }

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const totalCells =
    Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return Array.from(
    { length: totalCells },
    (_, index) => {
      const date = new Date(
        year,
        month,
        index - firstDay + 1
      );

      return {
        day: date.getDate(),
        current: date.getMonth() === month,
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      };
    }
  );
}

function getPrice(year, month, day) {
  if (year === 2021 && month === 4) {
    return MAY_PRICES[day] || null;
  }

  // Mock availability for other months.
  if (day >= 7 && day <= 21 && day % 6 !== 0) {
    return day % 7 === 1 ? 1500 : 1346;
  }

  return null;
}

// Main Component

function BookingPanel() {
  const [viewMonth, setViewMonth] = useState(
    new Date(2021, 4, 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    '2021-05-19'
  );

  const [dateChanged, setDateChanged] = useState(false);
  const [passengers, setPassengers] = useState(4);

  const [departureTime, setDepartureTime] = useState(
    '08:00 AM'
  );

  const [selectedPackage, setSelectedPackage] = useState(
    'full'
  );

  const [timeSlotsOpen, setTimeSlotsOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [addCamera, setAddCamera] = useState(false);
  const [dialog, setDialog] = useState('');

  const [openSections, setOpenSections] = useState({
    availability: true,
    dates: true,
    packages: true,
    pricing: true
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const calendarDays = getCalendarDays(year, month);

  const selected = PACKAGES.find(
    (item) => item.id === selectedPackage
  );

  const surcharge = 65;

  const extraPrice =
    addCamera && selectedPackage === 'full' ? 25 : 0;

  const subtotal = passengers * selected.price;

  const total = subtotal + surcharge + extraPrice;

  function changeMonth(direction) {
    setViewMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + direction,
          1
        )
    );
  }

  function chooseDate(day) {
    setSelectedDate(
      `${year}-${pad(month + 1)}-${pad(day)}`
    );

    setDateChanged(true);
  }

  function toggleSection(section) {
    setOpenSections((previous) => ({
      ...previous,
      [section]: !previous[section]
    }));
  }

  function updatePassengers(amount) {
    setPassengers((previous) =>
      Math.min(20, Math.max(1, previous + amount))
    );
  }

  function selectPackage(id) {
    setSelectedPackage(id);
    setCustomizeOpen(false);

    if (id !== 'full') {
      setAddCamera(false);
    }
  }

  function sectionHeader(title, section) {
    return (
      <button
        type="button"
        className="booking-heading"
        onClick={() => toggleSection(section)}
        aria-expanded={openSections[section]}
      >
        <span>{title}</span>

        <span className="section-toggle">
          {openSections[section] ? '−' : '+'}
        </span>
      </button>
    );
  }

  return (
    <aside className="booking-panel">

      {/* PRICE */}

      <div className="booking-price">
        <h3>Prices From</h3>

        <div className="booking-price-line">
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 3h9l9 9-9 9-9-9V3Z" />
          </svg>

          <strong>$280</strong>
          <span>per person</span>
        </div>
      </div>

      {/* CHECK AVAILABILITY */}

      <section className="booking-section">
        {sectionHeader(
          'Check Availability',
          'availability'
        )}

        {openSections.availability && (
          <div className="calendar-content">

            <div className="calendar-toolbar">
              <strong>
                {MONTHS[month]} {year}
              </strong>

              <div className="calendar-navigation">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  ◀
                </button>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="calendar-weekdays">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((cell) => {
                const price = cell.current
                  ? getPrice(year, month, cell.day)
                  : null;

                const available = Boolean(price);

                const cellDate =
                  `${year}-${pad(month + 1)}-${pad(cell.day)}`;

                const active =
                  dateChanged &&
                  selectedDate === cellDate;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={!available}
                    onClick={() => chooseDate(cell.day)}
                    className={[
                      'calendar-day',
                      !cell.current ? 'outside' : '',
                      available
                        ? 'available'
                        : 'unavailable',
                      active ? 'active' : ''
                    ].join(' ')}
                    aria-label={
                      available
                        ? `${cell.day} ${MONTHS[month]}, €${price}`
                        : `${cell.day} unavailable`
                    }
                  >
                    <span className="calendar-day-number">
                      {pad(cell.day)}
                    </span>

                    {available && (
                      <small>
                        €{price.toLocaleString('en-US')}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="calendar-note">
              Green dates are available.
              Prices vary by date.
            </p>
          </div>
        )}
      </section>

      {/* SELECT DATES AND DURATION */}

      <section className="booking-section">
        {sectionHeader(
          'Select Dates & Duration',
          'dates'
        )}

        {openSections.dates && (
          <div className="booking-dates-content">

            {/* DATE */}

            <div className="booking-field-row">
              <div>
                <h4>When?</h4>
                <p>Select you want to go.</p>
              </div>

              <button
                type="button"
                className="booking-value-box"
                onClick={() =>
                  setOpenSections((previous) => ({
                    ...previous,
                    availability: true
                  }))
                }
              >
                {formatDate(selectedDate)}
              </button>
            </div>

            {/* PASSENGERS */}

            <div className="booking-field-row">
              <div>
                <h4>Number of Passengers?</h4>
                <p>Number of people traveling.</p>
              </div>

              <div className="passenger-controls">
                <button
                  type="button"
                  onClick={() =>
                    updatePassengers(-1)
                  }
                  aria-label="Decrease passengers"
                  disabled={passengers <= 1}
                >
                  −
                </button>

                <span>{pad(passengers)}</span>

                <button
                  type="button"
                  onClick={() =>
                    updatePassengers(1)
                  }
                  aria-label="Increase passengers"
                  disabled={passengers >= 20}
                >
                  +
                </button>
              </div>
            </div>

            {/* DEPARTURE TIME */}

            <div className="booking-field-row">
              <div>
                <h4>Departure Time?</h4>
                <p>Your preferred time.</p>
              </div>

              <select
                className="booking-value-box booking-time-select"
                value={departureTime}
                onChange={(event) =>
                  setDepartureTime(event.target.value)
                }
                aria-label="Departure time"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* AVAILABLE TIME SLOTS */}

            <button
              type="button"
              className="time-slots-toggle"
              onClick={() =>
                setTimeSlotsOpen(!timeSlotsOpen)
              }
              aria-expanded={timeSlotsOpen}
            >
              <span className="time-slots-label">
                <span className="clock-symbol">
                  ◷
                </span>

                Available Time Slots
              </span>

              <span>
                {timeSlotsOpen ? '⌃' : '⌄'}
              </span>
            </button>

            {timeSlotsOpen && (
              <div className="time-slot-options">
                {TIME_SLOTS.map((time) => (
                  <button
                    type="button"
                    key={time}
                    className={
                      time === departureTime
                        ? 'chosen'
                        : ''
                    }
                    onClick={() => {
                      setDepartureTime(time);
                      setTimeSlotsOpen(false);
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* PACKAGES */}

      <section className="booking-section">
        {sectionHeader('Packages', 'packages')}

        {openSections.packages && (
          <div className="booking-packages">

            {PACKAGES.map((item) => (
              <div
                className={`package-option ${
                  selectedPackage === item.id
                    ? 'selected'
                    : ''
                }`}
                key={item.id}
              >
                <button
                  type="button"
                  className="package-option-button"
                  aria-pressed={
                    selectedPackage === item.id
                  }
                  onClick={() =>
                    selectPackage(item.id)
                  }
                >
                  <span className="package-information">
                    <span className="package-title">
                      {item.name}

                      {item.popular && (
                        <span className="popular-tag">
                          Popular
                        </span>
                      )}
                    </span>

                    <span className="package-description">
                      {item.description}
                    </span>
                  </span>

                  <strong>${item.price}</strong>
                </button>

                {/* CUSTOMIZE PACKAGE */}

                {selectedPackage === item.id &&
                  item.popular && (
                    <>
                      <button
                        type="button"
                        className="package-customize"
                        onClick={() =>
                          setCustomizeOpen(!customizeOpen)
                        }
                        aria-expanded={customizeOpen}
                      >
                        <PencilIcon />
                        Customize package
                      </button>

                      {customizeOpen && (
                        <label className="package-extra">
                          <input
                            type="checkbox"
                            checked={addCamera}
                            onChange={(event) =>
                              setAddCamera(
                                event.target.checked
                              )
                            }
                          />

                          Add underwater camera (+$25)
                        </label>
                      )}
                    </>
                  )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRICING DETAILS */}

      <section className="booking-section">
        {sectionHeader(
          'Pricing Details',
          'pricing'
        )}

        {openSections.pricing && (
          <div className="booking-pricing-content">

            {/* CANCELLATION BADGE */}

            <div className="cancellation-badge">
              <CheckCircleIcon />

              <span>
                Free cancellation before 9:00 AM on
                {' '}04/10/2025 local time (EST)
              </span>
            </div>

            {/* ADULTS PRICE */}

            <div className="pricing-row">
              <span>
                {passengers} Adults @ ${selected.price}
              </span>

              <strong>
                ${subtotal.toLocaleString('en-US')}
              </strong>
            </div>

            {/* SURCHARGE */}

            <div className="pricing-row secondary">
              <span>Operational Surcharge</span>
              <span>${surcharge}</span>
            </div>

            {/* EXTRA PRICE */}

            {extraPrice > 0 && (
              <div className="pricing-row secondary">
                <span>Underwater Camera</span>
                <span>${extraPrice}</span>
              </div>
            )}

            {/* TOTAL */}

            <div className="pricing-row pricing-total">
              <strong>Options Total</strong>

              <strong>
                ${total.toLocaleString('en-US')}
              </strong>
            </div>

            {/* PAYMENT NOTE */}

            <p className="payment-note">
              Your payment will only be charged when
              the booking request is confirmed by the
              boat operator.
            </p>

            {/* BOOK NOW */}

            <button
              type="button"
              className="book-now-btn"
              onClick={() => setDialog('book')}
            >
              BOOK NOW
            </button>

            {/* HAVE QUESTIONS */}

            <p className="booking-question">
              <strong>Have Questions?</strong>
              {' '}Is there any additional information
              you want to ask us?
            </p>

            {/* REQUEST QUOTE */}

            <button
              type="button"
              className="quote-btn"
              onClick={() => setDialog('quote')}
            >
              REQUEST A FREE QUOTE
            </button>
          </div>
        )}
      </section>

      {/* LOCAL DEMO DIALOG */}

      {dialog && (
        <div
          className="booking-dialog-backdrop"
          onClick={() => setDialog('')}
        >
          <div
            className="booking-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={
              dialog === 'book'
                ? 'Booking summary'
                : 'Quote information'
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="dialog-close"
              onClick={() => setDialog('')}
              aria-label="Close"
            >
              ×
            </button>

            <h3>
              {dialog === 'book'
                ? 'Booking Summary'
                : 'Request a Free Quote'}
            </h3>

            <p>Predator 65 SportFly</p>

            <p>
              Date: {formatDate(selectedDate)}
            </p>

            <p>Passengers: {passengers}</p>

            <p>Departure: {departureTime}</p>

            <p>Package: {selected.name}</p>

            <p>
              Total: ${total.toLocaleString('en-US')}
            </p>

            <p className="dialog-note">
              This is a local demo. No booking or
              payment has been submitted.
            </p>

            <button
              className="dialog-done"
              type="button"
              onClick={() => setDialog('')}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </aside>
  );
}

export default BookingPanel;
