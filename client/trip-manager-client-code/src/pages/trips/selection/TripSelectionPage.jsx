import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../api.js";
import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar.jsx";
import { canManageTrip } from "../../../permissions.js";
import "../TripsPage.css";

export default function TripSelectionPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    async function getTrips() {
      const res = await api.get("/api/trips");
      setTrips(res.data);
    }
    getTrips();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">בחר טיול</h1>
        <p>
          בחר את הטיול הרלוונטי כדי להמשיך לניווט ולניהול של תכנון ויום הטיול.
        </p>
        <div className="nav-cards">
          {trips.map((trip) => (
            <button
              key={trip.id}
              className="nav-card"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              <span className="nav-card__icon">🗺️</span>
              <span className="nav-card__body">
                <span className="nav-card__title">{trip.title}</span>
              </span>
              <span className="nav-card__arrow">←</span>
            </button>
          ))}
          {canManageTrip() && (
            <button
              className="nav-card nav-card--accent"
              onClick={() => navigate(`/trips/new`)}
            >
              <span className="nav-card__icon">➕</span>
              <span className="nav-card__body">
                <span className="nav-card__title">יצירת טיול חדש</span>
              </span>
              <span className="nav-card__arrow">←</span>
            </button>
          )}
        </div>
      </main>
    </>
  );
}
