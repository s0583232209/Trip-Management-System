import { useState } from "react";
import { useNavigate } from "react-router-dom";
import icon from "../assets/icon.png";
import InfoPopup from "./InfoPopup";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("current-user"));
  const [showInfo, setShowInfo] = useState(false);

  function handleLogout() {
    sessionStorage.clear();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>
        <img src={icon} alt="לוגו" className="navbar-logo" />
        <span className="navbar-title">מסלול בטוח</span>
      </div>
      <div className="navbar-actions">
        {user?.role === "principal" && (
          <button className="navbar-btn" onClick={() => navigate("/add-employee")}>הוספת עובד</button>
        )}
        <button className="navbar-btn" onClick={() => setShowInfo(true)}>פרופיל</button>
        <button className="navbar-btn navbar-btn--logout" onClick={handleLogout}>התנתקות</button>
      </div>
      {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}
    </nav>
  );
}
