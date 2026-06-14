import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar.jsx";
import api from "../../../api.js";
import { canManageTrip, isRole, TRIP_STATUS_LABEL } from "../../../permissions.js";
import "../TripsPage.css";
import { getTodayInIsrael, toDateOnlyString } from "../../../dateUtils.js";


export default function TripDashboardPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [tripTitle, setTripTitle] = useState("");
  const [tripStatus, setTripStatus] = useState(null);
  const [tripDate, setTripDate] = useState(null);
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
          setTripDate(trip.trip_date);
          setIsTripLeader(Number(trip.trip_leader_id) === Number(user.userId));
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) navigate("/not-found", { replace: true });
      });
  }, [tripId, navigate]);

  const isStaffOnly = isRole("trip leader", "teacher") && !canManageTrip() && !isTripLeader;
  const isTripDayToday = toDateOnlyString(tripDate) === getTodayInIsrael();
  const canAccessTripDay = canManageTrip() || isTripDayToday;

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="page-header">
          <h1 className="page-title">טיול {tripTitle}</h1>
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate("/trips")}>
            חזרה לבחירת טיול
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/planning`)}
          >
            תכנון טיול
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/day`)}
            disabled={!canAccessTripDay}
            title={!canAccessTripDay ? "ניתן להיכנס ל'יום טיול' רק ביום הטיול" : undefined}
          >
            יום טיול
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
