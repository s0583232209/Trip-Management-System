import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar.jsx";
import socket from "../../socket.js";
import api from "../../api.js";
import {
  canManageTrip,
  canHandleMinorEmergency,
  isRole,
} from "../../permissions.js";
import useTripTitle from "../../hooks/useTripTitle.js";
import "./TripsPage.css";
import "./TripDayPage.css";

export default function TripDayPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [alert, setAlert] = useState(null);
  const [isTripLeader, setIsTripLeader] = useState(false);
  const tripTitle = useTripTitle(tripId);

  const user = useSelector((state) => state.auth.user) || {};

  useEffect(() => {
    api
      .get(`/api/trips/${tripId}`)
      .then((res) => {
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (trip) setIsTripLeader(trip.trip_leader_id === user.userId);
      })
      .catch(() => {});

    socket.emit("join-trip", tripId);

    // שומרים רפרנס לפונקציות ה-handler כדי שה-cleanup יסיר רק את המאזינים
    // שנרשמו כאן, ולא ימחק מאזינים שרשמו קומפוננטות אחרות (socket הוא singleton משותף)
    function handleEmergencyAlert(data) {
      setAlert(data.emergency);
    }
    function handleEmergencyClosed() {
      setAlert(null);
    }

    socket.on("emergency-alert", handleEmergencyAlert);
    socket.on("emergency-closed", handleEmergencyClosed);

    return () => {
      socket.emit("leave-trip", tripId);
      socket.off("emergency-alert", handleEmergencyAlert);
      socket.off("emergency-closed", handleEmergencyClosed);
    };
  }, [tripId]);

  const isCritical = alert?.emergencyTypeId >= 2;
  const canSeeEmergency = true;

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
              onClick={() => navigate(`/trips/${tripId}/emergencies`)}
            >
              {" "}
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
        <h1 className="page-title">יום טיול — טיול {tripTitle || tripId}</h1>
        <p>בחר קטגוריה מתוך יום הטיול.</p>
        <div className="trips-cards">
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/attendance`)}
          >
            קריאת שמות
          </button>

          {canSeeEmergency && (
            <button
              className={`trip-card trip-card--emergency ${alert ? "trip-card--emergency-active" : ""}`}
              onClick={() => navigate(`/trips/${tripId}/emergencies`)}
            >
              {alert ? "🚨 חירום פעיל" : "מצב חירום"}
            </button>
          )}

          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/contacts`)}
          >
            פרטי קשר צוות
          </button>
        </div>
      </main>
    </>
  );
}
