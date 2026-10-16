import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">

      {/* Website Logo */}
      <div className="nav-logo">
        <img
          src="/images/logo-light.png"
          alt="Boating Beans Logo"
          className="navbar-logo-img"
        />
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        <a href="#destinations">DESTINATIONS</a>
        <a href="#tours">TOURS</a>
        <a href="#stories">STORIES</a>
        <a href="#operators">OPERATORS</a>
      </div>

      {/* Authentication Buttons */}
      <div className="nav-auth">
        <button type="button" className="login-btn">
          Log in
        </button>

        <button type="button" className="signup-btn">
          Sign up
        </button>
      </div>

    </nav>
  );
}

export default Navbar;