import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import "./TripsPage.css";

export default function TripDayPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">יום טיול — טיול {tripId}</h1>
        <p>בחר קטגוריה מתוך יום הטיול.</p>
        <div className="trips-cards">
          <button className="trip-card" onClick={() => navigate(`/trips/${tripId}/attendance`)}>
            קריאת שמות
          </button>
          <button className="trip-card" onClick={() => navigate(`/trips/${tripId}/emergency`)}>
            מצב חירום
          </button>
          <button className="trip-card" onClick={() => navigate(`/trips/${tripId}/contacts`)}>
            פרטי קשר צוות
          </button>
          <button className="trip-card" onClick={() => navigate(`/trips/${tripId}/status`)}>
            סטטוס הטיול
          </button>
        </div>
      </main>
    </>
  );
}
