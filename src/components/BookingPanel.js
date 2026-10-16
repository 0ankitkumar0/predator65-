
import React, { useState } from 'react';
import './BookingPanel.css';

// 1. DEMO DATA: ye sab local data hai, backend/API nahi.
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const TIMES = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'];

const MAY_PRICES = {
  7: 1346, 8: 1500, 9: 1346, 12: 1346, 13: 1346,
  14: 1346, 15: 1500, 16: 1346, 17: 1346, 18: 1346,
  19: 1346, 20: 1346, 21: 1346, 29: 1346
};

const PACKAGES = [
  {
    id: 'half',
    name: 'Half-Day Charter',
    price: 230,
    description: 'Basic equipment • Bait & tackle'
  },
  {
    id: 'full',
    name: 'Full-Day Adventure',
    price: 280,
    description: 'Premium equipment • All bait & tackle',
    popular: true
  },
  {
    id: 'extended',
    name: 'Extended Deep Sea',
    price: 350,
    description: 'Top-tier equipment • Premium bait'
  }
];

// 2. HELPERS: date/price ko screen par dikhane ke liye.
const pad = (n) => String(n).padStart(2, '0');
const money = (n) => n.toLocaleString('en-US');

function formatDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return `${pad(day)} ${MONTHS[month - 1].slice(0, 3).toUpperCase()} ${year}`;
}

// PDF ke May 2021 calendar ka original demo layout maintain kiya hai.
function calendarDays(year, month) {
  if (year === 2021 && month === 4) {
    return [
      { day: 28, current: false, key: 'previous-28' },
      ...Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        current: true,
        key: `may-${i + 1}`
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        day: i + 1,
        current: false,
        key: `next-${i + 1}`
      }))
    ];
  }

  const firstDay = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const cells = Math.ceil((firstDay + lastDay) / 7) * 7;

  return Array.from({ length: cells }, (_, i) => {
    const date = new Date(year, month, i - firstDay + 1);

    return {
      day: date.getDate(),
      current: date.getMonth() === month,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    };
  });
}

// Available date demo price.
function dayPrice(year, month, day) {
  if (year === 2021 && month === 4) {
    return MAY_PRICES[day] || null;
  }

  return day >= 7 && day <= 21 && day % 6 !== 0
    ? (day % 7 === 1 ? 1500 : 1346)
    : null;
}

// 3. ICONS: existing design same SVG icons.
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
        marginRight: 5
      }}
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CheckIcon() {
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
        marginRight: 5,
        flexShrink: 0
      }}
      aria-hidden="true"
    >
      <path d="M20 11.1V12a8 8 0 1 1-4.7-7.3" />
      <path d="m8.5 11.5 3 3 8-8" />
    </svg>
  );
}

// 4. ACCORDION: heading click se section open/close hota hai.
function Accordion({ title, open, onToggle, children }) {
  return (
    <section className="booking-section">
      <button
        type="button"
        className="booking-heading"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="section-toggle">{open ? '−' : '+'}</span>
      </button>

      {open && children}
    </section>
  );
}

// 5. CALENDAR: month change aur available date select hoti hai.
function Calendar({
  viewMonth,
  selectedDate,
  dateChanged,
  onMonthChange,
  onDateChange
}) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  return (
    <div className="calendar-content">
      <div className="calendar-toolbar">
        <strong>{MONTHS[month]} {year}</strong>

        <div className="calendar-navigation">
          <button type="button" onClick={() => onMonthChange(-1)}
            aria-label="Previous month">◀</button>
          <button type="button" onClick={() => onMonthChange(1)}
            aria-label="Next month">▶</button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {DAYS.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="calendar-grid">
        {calendarDays(year, month).map((cell) => {
          const price = cell.current
            ? dayPrice(year, month, cell.day)
            : null;

          const active = dateChanged &&
            selectedDate === `${year}-${pad(month + 1)}-${pad(cell.day)}`;

          const className = [
            'calendar-day',
            cell.current ? '' : 'outside',
            price ? 'available' : 'unavailable',
            active ? 'active' : ''
          ].join(' ');

          return (
            <button
              key={cell.key}
              type="button"
              className={className}
              disabled={!price}
              onClick={() => onDateChange(cell.day)}
              aria-label={price
                ? `${cell.day} ${MONTHS[month]}, €${price}`
                : `${cell.day} unavailable`
              }
            >
              <span className="calendar-day-number">
                {pad(cell.day)}
              </span>

              {price && <small>€{money(price)}</small>}
            </button>
          );
        })}
      </div>

      <p className="calendar-note">
        Green dates are available. Prices vary by date.
      </p>
    </div>
  );
}

// Same field layout Date, Passengers aur Departure ke liye reuse hota hai.
function Field({ title, help, children }) {
  return (
    <div className="booking-field-row">
      <div>
        <h4>{title}</h4>
        <p>{help}</p>
      </div>
      {children}
    </div>
  );
}

// 6. TRIP DETAILS: date, passengers, departure time aur time slots.
function TripDetails({
  date,
  onShowCalendar,
  passengers,
  onPassengerChange,
  time,
  onTimeChange,
  slotsOpen,
  onSlotsToggle
}) {
  return (
    <div className="booking-dates-content">
      <Field title="When?" help="Select you want to go.">
        <button type="button" className="booking-value-box"
          onClick={onShowCalendar}>
          {formatDate(date)}
        </button>
      </Field>

      <Field title="Number of Passengers?" help="Number of people traveling.">
        <div className="passenger-controls">
          <button
            type="button"
            onClick={() => onPassengerChange(-1)}
            aria-label="Decrease passengers"
            disabled={passengers <= 1}
          >−</button>

          <span>{pad(passengers)}</span>

          <button
            type="button"
            onClick={() => onPassengerChange(1)}
            aria-label="Increase passengers"
            disabled={passengers >= 20}
          >+</button>
        </div>
      </Field>

      <Field title="Departure Time?" help="Your preferred time.">
        <select
          className="booking-value-box booking-time-select"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          aria-label="Departure time"
        >
          {TIMES.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </Field>

      <button
        type="button"
        className="time-slots-toggle"
        onClick={onSlotsToggle}
        aria-expanded={slotsOpen}
      >
        <span className="time-slots-label">
          <span className="clock-symbol">◷</span>
          Available Time Slots
        </span>
        <span>{slotsOpen ? '⌃' : '⌄'}</span>
      </button>

      {slotsOpen && (
        <div className="time-slot-options">
          {TIMES.map((slot) => (
            <button
              type="button"
              key={slot}
              className={slot === time ? 'chosen' : ''}
              onClick={() => onTimeChange(slot, true)}
            >
              {slot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 7. PACKAGES: package select aur optional camera add-on.
function PackageOptions({
  selectedId,
  onSelect,
  customizeOpen,
  onCustomize,
  addCamera,
  onCameraChange
}) {
  return (
    <div className="booking-packages">
      {PACKAGES.map((item) => (
        <div
          key={item.id}
          className={`package-option ${selectedId === item.id ? 'selected' : ''}`}
        >
          <button
            type="button"
            className="package-option-button"
            aria-pressed={selectedId === item.id}
            onClick={() => onSelect(item.id)}
          >
            <span className="package-information">
              <span className="package-title">
                {item.name}
                {item.popular && <span className="popular-tag">Popular</span>}
              </span>
              <span className="package-description">{item.description}</span>
            </span>
            <strong>${item.price}</strong>
          </button>

          {selectedId === item.id && item.popular && (
            <>
              <button
                type="button"
                className="package-customize"
                onClick={onCustomize}
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
                    onChange={(e) => onCameraChange(e.target.checked)}
                  />
                  Add underwater camera (+$25)
                </label>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// 8. PRICING: package price x passengers + surcharge + extra.
function Pricing({
  passengers,
  selected,
  surcharge,
  extra,
  total,
  onBook,
  onQuote
}) {
  return (
    <div className="booking-pricing-content">
      <div className="cancellation-badge">
        <CheckIcon />
        <span>
          Free cancellation before 9:00 AM on 04/10/2025 local time (EST)
        </span>
      </div>

      <div className="pricing-row">
        <span>{passengers} Adults @ ${selected.price}</span>
        <strong>${money(passengers * selected.price)}</strong>
      </div>

      <div className="pricing-row secondary">
        <span>Operational Surcharge</span>
        <span>${surcharge}</span>
      </div>

      {extra > 0 && (
        <div className="pricing-row secondary">
          <span>Underwater Camera</span>
          <span>${extra}</span>
        </div>
      )}

      <div className="pricing-row pricing-total">
        <strong>Options Total</strong>
        <strong>${money(total)}</strong>
      </div>

      <p className="payment-note">
        Your payment will only be charged when the booking request
        is confirmed by the boat operator.
      </p>

      <button type="button" className="book-now-btn" onClick={onBook}>
        BOOK NOW
      </button>

      <p className="booking-question">
        <strong>Have Questions?</strong>{' '}
        Is there any additional information you want to ask us?
      </p>

      <button type="button" className="quote-btn" onClick={onQuote}>
        REQUEST A FREE QUOTE
      </button>
    </div>
  );
}


// 10. MAIN COMPONENT: state aur sections ko connect karta hai.
function BookingPanel() {
  // Calendar me kaunsa month dikhana hai.
  const [viewMonth, setViewMonth] = useState(new Date(2021, 4, 1));

  // User ki selected date aur uski selection ka status.
  const [selectedDate, setSelectedDate] = useState('2021-05-19');
  const [dateChanged, setDateChanged] = useState(false);

  // Booking ke details.
  const [passengers, setPassengers] = useState(4);
  const [departureTime, setDepartureTime] = useState('08:00 AM');

  // Full-Day package default selected hai.
  const [selectedPackage, setSelectedPackage] = useState('full');

  // Time slots aur package customization ki visibility.
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [addCamera, setAddCamera] = useState(false);

  // 'book', 'quote' ya '' (popup band).

  // Chaar accordion sections ki open/close state.
  const [open, setOpen] = useState({
    availability: true,
    dates: true,
    packages: true,
    pricing: true
  });

  // Selected package nikaalkar total automatically calculate hota hai.
  const selected = PACKAGES.find((item) => item.id === selectedPackage);
  const surcharge = 65;
  const extra = addCamera && selectedPackage === 'full' ? 25 : 0;
  const total = passengers * selected.price + surcharge + extra;

  // Heading click par section toggle.
  const toggle = (section) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Previous/next month show karo.
  const changeMonth = (step) => {
    setViewMonth((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() + step, 1)
    );
  };

  // Calendar se date select karo.
  const chooseDate = (day) => {
    const year = viewMonth.getFullYear();
    const month = pad(viewMonth.getMonth() + 1);
    setSelectedDate(`${year}-${month}-${pad(day)}`);
    setDateChanged(true);
  };

  // Passengers ko 1 se 20 ke beech rakho.
  const changePassengers = (step) => {
    setPassengers((prev) => Math.min(20, Math.max(1, prev + step)));
  };

  // Time choose karne par optionally time slots close karo.
  const changeTime = (time, closeSlots = false) => {
    setDepartureTime(time);
    if (closeSlots) setSlotsOpen(false);
  };

  // Package change par customization reset hoti hai.
  const choosePackage = (id) => {
    setSelectedPackage(id);
    setCustomizeOpen(false);
    if (id !== 'full') setAddCamera(false);
  };

  return (
    <aside className="booking-panel">
      {/* Base price */}
      <div className="booking-price">
        <h3>Prices From</h3>
        <div className="booking-price-line">
          <svg viewBox="0 0 24 24" width="32" height="32"
            fill="none" stroke="currentColor" strokeWidth="2.3"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3h9l9 9-9 9-9-9V3Z" />
          </svg>
          <strong>$230</strong>
          <span>per person</span>
        </div>
      </div>

      {/* Section 1: Availability Calendar */}
      <Accordion title="Check Availability" open={open.availability}
        onToggle={() => toggle('availability')}>
        <Calendar
          viewMonth={viewMonth}
          selectedDate={selectedDate}
          dateChanged={dateChanged}
          onMonthChange={changeMonth}
          onDateChange={chooseDate}
        />
      </Accordion>

      {/* Section 2: Date, Passengers & Time */}
      <Accordion title="Select Dates & Duration" open={open.dates}
        onToggle={() => toggle('dates')}>
        <TripDetails
          date={selectedDate}
          onShowCalendar={() =>
            setOpen((prev) => ({ ...prev, availability: true }))
          }
          passengers={passengers}
          onPassengerChange={changePassengers}
          time={departureTime}
          onTimeChange={changeTime}
          slotsOpen={slotsOpen}
          onSlotsToggle={() => setSlotsOpen((prev) => !prev)}
        />
      </Accordion>

      {/* Section 3: Packages */}
      <Accordion title="Packages" open={open.packages}
        onToggle={() => toggle('packages')}>
        <PackageOptions
          selectedId={selectedPackage}
          onSelect={choosePackage}
          customizeOpen={customizeOpen}
          onCustomize={() => setCustomizeOpen((prev) => !prev)}
          addCamera={addCamera}
          onCameraChange={setAddCamera}
        />
      </Accordion>

      {/* Section 4: Pricing Details */}
      <Accordion title="Pricing Details" open={open.pricing}
        onToggle={() => toggle('pricing')}>
        <Pricing
          passengers={passengers}
          selected={selected}
          surcharge={surcharge}
          extra={extra}
          total={total}
        />
      </Accordion>  
    </aside>
  );
}

export default BookingPanel;
