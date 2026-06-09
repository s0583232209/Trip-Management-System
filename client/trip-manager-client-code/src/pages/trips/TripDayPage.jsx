import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import "./TripsPage.css";

export default function TripDayPage() {
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
        <h1 className="page-title">יום טיול — טיול {tripId}</h1>
        <p>בחר קטגוריה מתוך יום הטיול.</p>
        <div className="trips-cards">
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/attendance`)}
          >
            קריאת שמות
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/emergencies`)}
          >
            מצב חירום
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/contacts`)}
          >
            פרטי קשר צוות
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/status`)}
          >
            סטטוס הטיול
          </button>
        </div>
      </main>
    </>
  );
}
