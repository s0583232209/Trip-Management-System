import { useNavigate } from "react-router-dom";
import icon from "../assets/icon.png";
import { useEffect, useState } from "react";
import "./Navbar.css";
import api from "../api.js";
import socket from "../socket.js";

export default function Navbar() {
  const navigate = useNavigate();
  const [tripDayOfTrip, setTripDayOfTrip] = useState(null);
  const [alert, setAlert] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("current-user"));

  function handleLogout() {
    sessionStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    async function getTrips() {
      try {
        const res = await api.get("/api/trips");
        const trips = res.data;
        if (!trips || !trips.length) return;
        for (let i = 0; i < trips.length; i++) {
          if (new Date(trips[i].trip_date).toDateString() === new Date().toDateString()) {
            setTripDayOfTrip(trips[i].id);
            break;
          }
        }
      } catch (err) {
        console.error("Navbar trips fetch error", err);
      }
    }
    getTrips();
  }, []);

  useEffect(() => {
    if (!tripDayOfTrip) return;
    socket.emit("join-trip", tripDayOfTrip);
    socket.on("emergency-alert", (data) => {
      setAlert(data.emergency);
      playAlertSound();
    });
    socket.on("emergency-closed", () => setAlert(null));
    return () => {
      socket.emit("leave-trip", tripDayOfTrip);
      socket.off("emergency-alert");
      socket.off("emergency-closed");
    };
  }, [tripDayOfTrip]);

  function playAlertSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.4, 0.8].forEach((startTime) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(880, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.6, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + 0.35);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + 0.35);
      });
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }

  const isCritical = alert?.emergencyTypeId >= 2;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <img src={icon} alt="לוגו" className="navbar-logo" />
          <span className="navbar-title">מסלול בטוח</span>
        </div>
        <div className="navbar-links">
          <button className="navbar-btn" onClick={() => navigate("/")}>תפריט</button>
          <button className="navbar-btn" onClick={() => navigate("/trips")}>טיולים</button>
          <button className="navbar-btn" onClick={() => navigate("/media")}>מדיה</button>
          <button className="navbar-btn" onClick={() => navigate("/profile")}>פרופיל</button>
          {user?.role === "principal" && (
            <button className="navbar-btn" onClick={() => navigate("/add-employee")}>ניהול</button>
          )}
          {tripDayOfTrip && (
            <button
              className="navbar-btn navbar-btn--tripday"
              onClick={() => navigate(`/trips/${tripDayOfTrip}/day`)}
            >
              🚶 יום טיול
            </button>
          )}
        </div>
        <div className="navbar-actions">
          {user?.role === "principal" && (
            <button className="navbar-btn" onClick={() => navigate("/add-employee")}>הוספת עובד</button>
          )}
          <button className="navbar-btn navbar-btn--logout" onClick={handleLogout}>התנתקות</button>
        </div>
      </nav>

      {alert && (
        <div
          className={`emergency-banner ${isCritical ? "banner-critical" : "banner-minor"}`}
          style={{ position: "sticky", top: 0, zIndex: 99, display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1.5rem", width: "100%", boxSizing: "border-box" }}
        >
          <span>{isCritical ? "🚨" : "⚠️"}</span>
          <span style={{ flex: 1 }}>
            {isCritical ? "חירום קריטי" : "חירום מינורי"}: {alert.description}
          </span>
          <button onClick={() => navigate(`/trips/${tripDayOfTrip}/emergency`)}>צפה בפרטים</button>
          <button onClick={() => setAlert(null)}>✕</button>
        </div>
      )}
    </>
  );
}
