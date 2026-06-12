import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import { canManageTrip } from "../../permissions.js";
import "./TripsPage.css";

export default function TripDashboardPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [tripTitle, setTripTitle] = useState("");

  useEffect(() => {
    api
      .get(`/api/trips/${tripId}`)
      .then((res) => {
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!trip) {
          navigate("/not-found", { replace: true });
        } else {
          setTripTitle(trip.title);
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          navigate("/not-found", { replace: true });
        }
      });
  }, [tripId, navigate]);
  async function closeTrip() {
    try {
      console.log("Closing trip " + tripId);
      const res = await api.put(`/api/trips/${tripId}/close`);
      console.log(res);
    } catch (err) {
      console.error("Error closing trip:", err);
    }
  }
  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">טיול {tripTitle || tripId}</h1>
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
          {canManageTrip() && (
            <button className="trip-card" onClick={closeTrip}>
              סגירת הטיול
            </button>
          )}
        </div>
      </main>
    </>
  );
}
