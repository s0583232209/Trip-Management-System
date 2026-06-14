import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar.jsx";
import api from "../../../api.js";
import { canManageTrip, isRole, TRIP_STATUS_LABEL } from "../../../permissions.js";
import "../TripsPage.css";

export default function TripDashboardPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [tripTitle, setTripTitle] = useState("");
  const [tripStatus, setTripStatus] = useState(null);
  const [isTripLeader, setIsTripLeader] = useState(false);

  const user = useSelector((state) => state.auth.user) || {};

  useEffect(() => {
    api
      .get(`/api/trips/${tripId}`)
      .then((res) => {
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!trip) {
          navigate("/not-found", { replace: true });
        } else {
          setTripTitle(trip.title);
          setTripStatus(trip.trip_status ?? null);
          setIsTripLeader(Number(trip.trip_leader_id) === Number(user.userId));
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) navigate("/not-found", { replace: true });
      });
  }, [tripId, navigate]);

  // מורה/אחראי שאינו אחראי הטיול הספציפי — רק צפייה
  const isStaffOnly = isRole("trip leader", "teacher") && !canManageTrip() && !isTripLeader;

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="page-header">
          <h1 className="page-title">טיול {tripTitle}</h1>
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate("/trips")}>
            חזרה לבחירת טיול
          </button>
        </div>
        {tripStatus != null && (
          <div className={`trip-status-badge trip-status-badge--${tripStatus}`}>
            {TRIP_STATUS_LABEL[tripStatus] || tripStatus}
          </div>
        )}
        <div className="nav-cards">
          <button className="nav-card" onClick={() => navigate(`/trips/${tripId}/planning`)}>
            <span className="nav-card__icon">📋</span>
            <span className="nav-card__body">
              <span className="nav-card__title">תכנון טיול</span>
              <span className="nav-card__desc">מסלול, צוות, תיק טיול</span>
            </span>
            <span className="nav-card__arrow">←</span>
          </button>
          <button className="nav-card" onClick={() => navigate(`/trips/${tripId}/day`)}>
            <span className="nav-card__icon">📅</span>
            <span className="nav-card__body">
              <span className="nav-card__title">יום טיול</span>
              <span className="nav-card__desc">חירום, קשר צוות, ניהול בזמן אמת</span>
            </span>
            <span className="nav-card__arrow">←</span>
          </button>
          {canManageTrip() && (
            <button className="nav-card" onClick={() => navigate(`/trips/${tripId}/status`)}>
              <span className="nav-card__icon">⚙️</span>
              <span className="nav-card__body">
                <span className="nav-card__title">ניהול סטטוס</span>
                <span className="nav-card__desc">אישור, סגירה, עריכה בדיעבד</span>
              </span>
              <span className="nav-card__arrow">←</span>
            </button>
          )}
        </div>
      </main>
    </>
  );
}
