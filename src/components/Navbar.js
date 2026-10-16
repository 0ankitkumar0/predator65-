function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src="/images/logo-light.png" alt="Boating Beans Logo" className="navbar-logo-img" />
      </div>

      <div className="nav-links">
        <a href="#destinations">DESTINATIONS</a>
        <a href="#tours">TOURS</a>
        <a href="#stories">STORIES</a>
        <a href="#operators">OPERATORS</a>
      </div>

      <div className="nav-auth">
        <button className="login-btn">Log in</button>
        <button className="signup-btn">Sign up</button>
      </div>
    </nav>
  );
}

export default Navbar;