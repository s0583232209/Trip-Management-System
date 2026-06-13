import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import { canManageTrip, isRole, TRIP_STATUS_LABEL } from "../../permissions.js";
import "./TripsPage.css";

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
          setIsTripLeader(trip.trip_leader_id === user.userId);
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
        <h1 className="page-title">טיול {tripTitle || tripId}</h1>
        {tripStatus != null && (
          <p className="form-section-hint">סטטוס: <strong>{TRIP_STATUS_LABEL[tripStatus] || tripStatus}</strong></p>
        )}
        <div className="trips-cards">
          <button className="trip-card" onClick={() => navigate(`/trips/${tripId}/planning`)}>
            תכנון טיול
          </button>
          <button className="trip-card" onClick={() => navigate(`/trips/${tripId}/day`)}>
            יום טיול
          </button>
          {canManageTrip() && (
            <button className="trip-card" onClick={() => navigate(`/trips/${tripId}/status`)}>
              ניהול סטטוס
            </button>
          )}
        </div>
      </main>
    </>
  );
}
