import "./Dashboard.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userLoginContext } from "../../contexts/userLoginContext";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const { LogoutUser, currentUser} = useContext(userLoginContext);
  //location
  const location = useLocation();
  const isExamPage = location.pathname.includes("/dashboard/exam/");
  // Get stored active section or default to profile
  const getStoredSection = () => {
    if (localStorage.getItem("isNewUser") === "true") {
      return "updateProfile";
    }
    return localStorage.getItem("activeSection") || "profile";
  };

  const [activeSection, setActiveSection] = useState(getStoredSection);

  useEffect(() => {
    const storedSection = localStorage.getItem("activeSection");
    if (storedSection !== activeSection) {
      localStorage.setItem("activeSection", activeSection);
      navigate(`/dashboard/${activeSection}`);
    }
  }, [activeSection, navigate]);

  const handleLogout = async () => {
    await LogoutUser();
    localStorage.removeItem("activeSection");
    localStorage.removeItem("isNewUser"); // Clear new user flag on logout
    navigate("/login");
  };

  return (
    <div className={`dashboard-layout ${isExamPage ? "exam-mode" : ""}`}>
      {!isExamPage &&(
      <div className="dashboard-sidebar">
        <Link to="/dashboard/exams">Exams</Link> 
        <Link to="/">Notifications</Link>
        <Link to="/">Detailed Analysis</Link>
        <Link to="/dashboard/updateProfile">Update Profile</Link>
        {currentUser?.role === "admin" && (
          <Link to="/dashboard/verify-teacher">Verification</Link>
        )}
        <Link to="/dashboard/changepassword">Change Password</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>)}

      <div className="dashboard-main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
