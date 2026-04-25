import "./Header.css";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { userLoginContext } from "../../contexts/userLoginContext";
import { useLocation } from "react-router-dom";

function Header() {
  const { userLoginStatus } = useContext(userLoginContext);
  const location = useLocation();
  const isExamPage = location.pathname.includes("/dashboard/exam/");

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`${isExamPage ? "exam-mode" : ""}`}>
      {!isExamPage && (
        <div className="home-header flex">
          <div className="website-name">
            <a href="/" style={{ color: "black" }}>
              OES
            </a>
          </div>

          {/* Normal Navigation */}
          <div className="nav-links">
            <div className="header-option">
              <Link to="/">Home</Link>
            </div>

            <div className="header-option">
              <Link to="/features">Features</Link>
            </div>

            <div className="header-option">
              <Link to="/aboutus">About Us</Link>
            </div>

            <div className="header-option">
              <Link to="/feedback">Feedback</Link>
            </div>

            <div className="header-option">
              {userLoginStatus ? (
                <Link to="/dashboard/profile">Profile</Link>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </div>

            <div className="header-option">
              <button className="btn btn-primary">Take Demo Test</button>
            </div>
          </div>

          {/* Hamburger Icon */}
          <div className="hamburger" onClick={toggleMobileMenu}>
            ☰
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mobile-menu">
              <Link to="/" onClick={toggleMobileMenu}>Home</Link>
              <Link to="/features" onClick={toggleMobileMenu}>Features</Link>
              <Link to="/aboutus" onClick={toggleMobileMenu}>About Us</Link>
              <Link to="/feedback" onClick={toggleMobileMenu}>Feedback</Link>
              {userLoginStatus && (
                <Link to="/dashboard/profile" onClick={toggleMobileMenu}>Profile</Link>
              )}
              {/* No Login and No Demo Test button here in mobile menu */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Header;
