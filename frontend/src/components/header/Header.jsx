import "./Header.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { userLoginContext } from "../../contexts/userLoginContext";

function Header() {
  const { userLoginStatus } = useContext(userLoginContext);

  return (
    <div>
      <div className="home-header flex">
        <div className="website-name">
          <a href="/" style={{ color: "black" }}>OES</a>
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
    </div>
  );
}

export default Header;
