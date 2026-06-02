import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import "./TripsPage.css";

export default function TripDashboardPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

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
