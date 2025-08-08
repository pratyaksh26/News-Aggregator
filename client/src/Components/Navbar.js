import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import countries from "./Countrieslist";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowDown, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Navbar.css'; // Make sure to import your CSS here

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [active, setActive] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to light-theme
    return localStorage.getItem('theme') || "light-theme";
  });

  let category = ["business", "entertainment", "general", "health", "science", "sports", "technology", "politics"];

  useEffect(() => {
    document.body.className = theme;
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "light-theme" ? "dark-theme" : "light-theme");
  }

  return (
    <header className="">
      <nav className="nav">
        <h3 className="heading">News App</h3>

        <ul className={active ? "nav-ul active" : "nav-ul"}>
          {/* <li><Link className="nav-link" to="/home" >Home</Link></li> */}
          <li><Link className="nav-link" to="/" >All News</Link></li>
          <li className="dropdown-li">
            <Link className="nav-link dropdown-toggle" onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowCountryDropdown(false) }}>
              Top-Headlines <FontAwesomeIcon className={showCategoryDropdown ? "down-arrow-icon down-arrow-icon-active" : "down-arrow-icon"} icon={faCircleArrowDown} />
            </Link>
            <ul className={showCategoryDropdown ? "dropdown show-dropdown" : "dropdown"}>
              {category.map((element, index) => (
                <li key={index} onClick={() => { setShowCategoryDropdown(!showCategoryDropdown) }}>
                  <Link to={"/top-headlines/" + element} className="dropdown-link" onClick={() => { setActive(!active) }}>
                    {element}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="dropdown-li">
            <Link className="nav-link dropdown-toggle" onClick={() => { setShowCountryDropdown(!showCountryDropdown); setShowCategoryDropdown(false) }}>
              Country <FontAwesomeIcon className={showCountryDropdown ? "down-arrow-icon down-arrow-icon-active" : "down-arrow-icon"} icon={faCircleArrowDown} />
            </Link>
            <ul className={showCountryDropdown ? "dropdown show-dropdown" : "dropdown"}>
              {countries.map((element, index) => (
                <li key={index} onClick={() => { setShowCountryDropdown(!showCountryDropdown) }}>
                  <Link to={"/country/" + element?.iso_2_alpha} className="dropdown-link" onClick={() => { setActive(!active) }}>
                    <img
                      src={element?.png}
                      srcSet={`https://flagcdn.com/32x24/${element?.iso_2_alpha}.png 2x`}
                      alt={element?.countryName} />
                    <span>{element?.countryName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <div className="theme-toggle">
              <input
                type="checkbox"
                className="checkbox"
                id="checkbox"
                checked={theme === "dark-theme"}
                onChange={toggleTheme}
              />
              <label htmlFor="checkbox" className="checkbox-label">
                <i className="fas fa-moon"></i>
                <i className="fas fa-sun"></i>
                <span className="ball"></span>
              </label>
            </div>
          </li>
        </ul>

        {/* User Authentication Section */}
        <div className="auth-section">
          {isAuthenticated() ? (
            <div className="user-menu">
              <div
                className="user-info"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <FontAwesomeIcon icon={faUser} />
                <span className="user-name">{user?.name}</span>
                <FontAwesomeIcon
                  className={showUserDropdown ? "down-arrow-icon down-arrow-icon-active" : "down-arrow-icon"}
                  icon={faCircleArrowDown}
                />
              </div>
              <div className={showUserDropdown ? "user-dropdown show-dropdown" : "user-dropdown"}>
                <button className="dropdown-link" onClick={logout}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link className="login-btn" to="/login">Login</Link>
          )}
        </div>

        <div className={active ? "ham-burger ham-open" : "ham-burger"} onClick={() => { setActive(!active) }}>
          <span className="lines line-1"></span>
          <span className="lines line-2"></span>
          <span className="lines line-3"></span>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
