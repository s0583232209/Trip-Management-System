import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import socket from "../../socket.js";
import "./TripsPage.css";
import "./TripDayPage.css";

export default function TripDayPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    socket.emit("join-trip", tripId);

    socket.on("emergency-alert", (data) => {
      setAlert(data.emergency);
    });

    socket.on("emergency-closed", () => {
      setAlert(null);
    });

    return () => {
      socket.emit("leave-trip", tripId);
      socket.off("emergency-alert");
      socket.off("emergency-closed");
    };
  }, [tripId]);

  const isCritical = alert?.emergencyTypeId >= 2;

  return (
    <>
      <Navbar />

      {alert && (
        <div
          className={`emergency-banner ${isCritical ? "banner-critical" : "banner-minor"}`}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 99,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 1.5rem",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <span className="banner-icon">{isCritical ? "🚨" : "⚠️"}</span>
          <span className="banner-text" style={{ flex: 1 }}>
            {isCritical ? "חירום קריטי" : "חירום מינורי"}: {alert.description}
          </span>
          <div className="banner-actions">
            <button
              className="banner-btn banner-btn--view"
              onClick={() => navigate(`/trips/${tripId}/emergency`)}
            >
              צפה בפרטים
            </button>
            <button
              className="banner-btn banner-btn--close"
              onClick={() => setAlert(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="page-main">
        <h1 className="page-title">יום טיול — טיול {tripId}</h1>
        <p>בחר קטגוריה מתוך יום הטיול.</p>

        <div className="trips-cards">
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/attendance`)}
          >
            קריאת שמות
          </button>

          <button
            className={`trip-card trip-card--emergency ${alert ? "trip-card--emergency-active" : ""}`}
            onClick={() => navigate(`/trips/${tripId}/emergencies`)}
          >
            {alert ? "🚨 חירום פעיל" : "מצב חירום"}
          </button>

          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/contacts`)}
          >
            פרטי קשר צוות
          </button>

          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/status`)}
          >
            סטטוס הטיול
          </button>
        </div>
      </main>
    </>
  );
}
