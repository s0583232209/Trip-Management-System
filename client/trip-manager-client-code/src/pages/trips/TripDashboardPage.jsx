import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import "./TripsPage.css";

export default function TripDashboardPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  useEffect(() => {
    api
      .get(`/api/trips/${tripId}`)
      .then((res) => {
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!trip) {
          navigate("/not-found", { replace: true });
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          navigate("/not-found", { replace: true });
        }
      });
  }, [tripId, navigate]);

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">טיול {tripId}</h1>
        <p>בחר אם אתה רוצה להמשיך אל תכנון טיול או אל יום טיול.</p>
        <div className="trips-cards">
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/planning`)}
          >
            תכנון טיול
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/day`)}
          >
            יום טיול
          </button>
        </div>
      </main>
    </>
  );
}
