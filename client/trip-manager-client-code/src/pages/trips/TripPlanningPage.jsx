import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import "./TripsPage.css";

export default function TripPlanningPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">תכנון טיול — טיול {tripId}</h1>
        <p>בחר קטגוריה מתוך תכנון הטיול.</p>
        <div className="trips-cards">
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/folder`)}
          >
            תיק טיול
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/staff`)}
          >
            אנשי צוות
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/equipment`)}
          >
            ציוד
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/documents`)}
          >
            מסמכים
          </button>
          <button
            className="trip-card"
            onClick={() => navigate(`/trips/${tripId}/route`)}
          >
            עדכון מסלול וצפיה בפרטי מסלול
          </button>
        </div>
      </main>
    </>
  );
}
