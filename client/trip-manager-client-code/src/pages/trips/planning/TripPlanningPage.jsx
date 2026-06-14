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
        <h1 className="page-title">תכנון טיול — טיול {tripTitle}</h1>
        <p>בחר קטגוריה מתוך תכנון הטיול.</p>
        <div className="trips-cards">
          {(canManageTrip() || Number(user.userId) === Number(tripLeaderId)) && (
            <button
              className="trip-card"
              onClick={() => navigate(`/trips/${tripId}/folder`)}
            >
              תיק טיול
            </button>
          )}
          {canManageTrip() && (
            <button
              className="trip-card"
              onClick={() => navigate(`/trips/${tripId}/staff`)}
            >
              אנשי צוות
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
            <button
              className="trip-card"
              onClick={() => navigate(`/trips/${tripId}/route`)}
            >
              {canUpdateRoute(tripStatus, tripDate, tripLeaderId) ? "עדכון מסלול וצפיה בפרטי מסלול" : "צפייה בפרטי מסלול"}
            </button>
          )}
          {canManageTrip() && (
            <form>
              <button className="trip-card" type="button" onClick={handleDelete}>
                מחק טיול
              </button>
            </form>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </main>
    </>
  );
}
