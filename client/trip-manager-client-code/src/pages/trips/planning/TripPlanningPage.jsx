import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar.jsx";
import api from "../../../api.js";
import { canManageTrip, canUpdateRoute, canViewTripDetails } from "../../../permissions.js";
import "../TripsPage.css";

export default function TripPlanningPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const user = useSelector((state) => state.auth.user) || {};
  const [error, setError] = useState("");
  const [tripDate, setTripDate] = useState(null);
  const [tripLeaderId, setTripLeaderId] = useState(null);
  const [tripTitle, setTripTitle] = useState("");
  const [tripStatus, setTripStatus] = useState(null);

  useEffect(() => {
    api
      .get(`/api/trips/${tripId}`)
      .then((res) => {
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!trip) {
          navigate("/not-found", { replace: true });
        } else {
          setTripDate(trip.trip_date);
          setTripLeaderId(trip.trip_leader_id);
          setTripTitle(trip.title);
          setTripStatus(trip.trip_status ?? null);
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          navigate("/not-found", { replace: true });
        }
      });
  }, [tripId, navigate]);

  async function handleDelete() {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הטיול?")) return;
    try {
      await api.delete(`/api/trips/${tripId}`);
      navigate("/trips");
    } catch (err) {
      setError(err.response?.data?.message || "מחיקת הטיול נכשלה, נסה שנית");
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="page-header">
          <h1 className="page-title">תכנון טיול — טיול {tripTitle}</h1>
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate(`/trips/${tripId}`)}>
            חזרה לטיול
          </button>
        </div>
        <p>בחר קטגוריה מתוך תכנון הטיול.</p>
        <div className="nav-cards">
          {(canManageTrip() || Number(user.userId) === Number(tripLeaderId)) && (
            <button className="nav-card" onClick={() => navigate(`/trips/${tripId}/folder`)}>
              <span className="nav-card__icon">📂</span>
              <span className="nav-card__body">
                <span className="nav-card__title">תיק טיול</span>
                <span className="nav-card__desc">מסמכים, אישורים וקבצים</span>
              </span>
              <span className="nav-card__arrow">←</span>
            </button>
          )}
          {canManageTrip() && (
            <button className="nav-card" onClick={() => navigate(`/trips/${tripId}/staff`)}>
              <span className="nav-card__icon">👥</span>
              <span className="nav-card__body">
                <span className="nav-card__title">אנשי צוות</span>
                <span className="nav-card__desc">מורים וצוות חיצוני</span>
              </span>
              <span className="nav-card__arrow">←</span>
            </button>
          )}
          {canManageTrip() && (
            <button
              className="trip-card"
              onClick={() => navigate(`/trips/example-kit`)}
            >
              צפייה בתיק טיול לדוגמה וקבצים ריקים להורדה
            </button>
          )}
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/useful-links`)}
          >
            קישורים שימושיים
          </button>
          {canViewTripDetails() && (
            <button className="nav-card" onClick={() => navigate(`/trips/${tripId}/route`)}>
              <span className="nav-card__icon">🗺️</span>
              <span className="nav-card__body">
                <span className="nav-card__title">
                  {canUpdateRoute(tripStatus, tripDate, tripLeaderId) ? "עדכון מסלול" : "צפייה במסלול"}
                </span>
                <span className="nav-card__desc">עצירות, אטרקציות ומסלולי הליכה</span>
              </span>
              <span className="nav-card__arrow">←</span>
            </button>
          )}
          {canManageTrip() && (
            <button className="nav-card nav-card--danger" type="button" onClick={handleDelete}>
              <span className="nav-card__icon">🗑️</span>
              <span className="nav-card__body">
                <span className="nav-card__title">מחק טיול</span>
                <span className="nav-card__desc">פעולה בלתי הפיכה</span>
              </span>
              <span className="nav-card__arrow">←</span>
            </button>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </main>
    </>
  );
}
