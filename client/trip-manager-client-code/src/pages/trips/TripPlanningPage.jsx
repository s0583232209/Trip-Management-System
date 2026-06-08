import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import "./TripsPage.css";

export default function TripPlanningPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [error, setError] = useState("");

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
          <form>
            <button className="trip-card" type="button" onClick={handleDelete}>
              מחק טיול
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </main>
    </>
  );
}
