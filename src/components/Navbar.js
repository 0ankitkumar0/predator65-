function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span className="logo-icon">◢</span>
        <span>Boating Beans</span>
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