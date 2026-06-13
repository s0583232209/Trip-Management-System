import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar.jsx";
import "./TripsPage.css";

export default function TripsPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">טיולים</h1>
        <div className="trips-grid">
          <div className="trips-section">
            <h2 className="trips-section-title">תכנון טיול</h2>
            <div className="trips-cards">
              <button
                className="trip-card"
                onClick={() => navigate("/trips/folder")}
              >
                תיק טיול
              </button>
              <button
                className="trip-card"
                onClick={() => navigate("/trips/staff")}
              >
                אנשי צוות
              </button>
              <button
                className="trip-card"
                onClick={() => navigate("/trips/equipment")}
              >
                ציוד
              </button>
              <button
                className="trip-card"
                onClick={() => navigate("/trips/documents")}
              >
                מסמכים
              </button>
            </div>
          </div>
          <div className="trips-section">
            <h2 className="trips-section-title">יום טיול</h2>
            <div className="trips-cards">
              <button
                className="trip-card"
                onClick={() => navigate("/trips/attendance")}
              >
                קריאת שמות
              </button>
              <button
                className="trip-card"
                onClick={() => navigate("/trips/emergencies")}
              >
                מצב חירום
              </button>
              <button
                className="trip-card"
                onClick={() => navigate("/trips/contacts")}
              >
                פרטי קשר צוות
              </button>
              <button
                className="trip-card"
                onClick={() => navigate("/trips/status")}
              >
                סטטוס הטיול
              </button>
            </div>
          </div>
        </div>
        {user?.role === "principal" && (
          <div className="trips-section">
            <h2 className="trips-section-title">ניהול</h2>
            <div className="trips-cards">
              <button
                className="trip-card"
                onClick={() => navigate("/add-employee")}
              >
                הוספת משתמש
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
