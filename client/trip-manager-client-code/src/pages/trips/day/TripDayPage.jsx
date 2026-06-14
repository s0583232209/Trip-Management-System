import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar.jsx";
import socket from "../../../socket.js";
import api from "../../../api.js";
import {
  canManageTrip,
  canHandleMinorEmergency,
  isRole,
} from "../../../permissions.js";
import useTripTitle from "../../../hooks/useTripTitle.js";
import "../TripsPage.css";
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
        if (trip) setIsTripLeader(Number(trip.trip_leader_id) === Number(user.userId));
      })
      .catch(() => {});

    socket.emit("join-trip", tripId);

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
        <div className={`emergency-banner ${isCritical ? "banner-critical" : "banner-minor"}`}>
          <span className="banner-icon">{isCritical ? "🚨" : "⚠️"}</span>
          <span className="banner-text">
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
        <h1 className="page-title">יום טיול — טיול {tripTitle}</h1>
        <p>בחר קטגוריה מתוך יום הטיול.</p>
        <div className="nav-cards">
          <button className="nav-card trip-card--disabled" disabled>
            <span className="nav-card__icon">📋</span>
            <span className="nav-card__body">
              <span className="nav-card__title">קריאת שמות</span>
              <span className="nav-card__desc">בקרוב</span>
            </span>
          </button>
          {canSeeEmergency && (
            <button
              className={`nav-card nav-card--emergency${alert ? " nav-card--emergency-active" : ""}`}
              onClick={() => navigate(`/trips/${tripId}/emergencies`)}
            >
              <span className="nav-card__icon">{alert ? "🚨" : "🏥"}</span>
              <span className="nav-card__body">
                <span className="nav-card__title">{alert ? "🚨 חירום פעיל" : "מצב חירום"}</span>
                <span className="nav-card__desc">דיווח וניהול אירועי חירום</span>
              </span>
              <span className="nav-card__arrow">←</span>
            </button>
          )}
          <button className="nav-card" onClick={() => navigate(`/trips/${tripId}/contacts`)}>
            <span className="nav-card__icon">📒</span>
            <span className="nav-card__body">
              <span className="nav-card__title">פרטי קשר צוות</span>
              <span className="nav-card__desc">טלפונים ומידע לאנשי הצוות</span>
            </span>
            <span className="nav-card__arrow">←</span>
          </button>
        </div>
      </main>
    </>
  );
}
