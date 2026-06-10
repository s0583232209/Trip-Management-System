import { useNavigate, useParams } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import AddTripTeachers from "./AddTripTeachers.jsx";
import AddTripExternalStaff from "./AddExternalStaff.jsx";
import { canManageTrip } from "../../permissions.js";
import "./TripsPage.css";
import "./TripForms.css";

export default function ManageTripStaffPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  if (!canManageTrip()) return <Navigate to="/unauthorized" replace />;

  return (
    <>
      <Navbar />
      <main
        className="page-main"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}
      >
        <h1
          className="page-title"
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          ניהול ושיבוץ צוות הטיול {tripId}
        </h1>

        {/* קונטיינר Flexbox שמציב את שני הטפסים זה לצד זה */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap" /* גורם להם לרדת שורה במסכים קטנים כמו טלפונים */,
          }}
        >
          <div style={{ flex: 1, minWidth: "320px" }}>
            <AddTripTeachers tripId={tripId} />
          </div>

          <div style={{ flex: 1, minWidth: "320px" }}>
            <AddTripExternalStaff tripId={tripId} />
          </div>
        </div>

        {/* שורת פעולות כללית לתחתית העמוד */}
        <div
          className="form-actions-row"
          style={{ marginTop: "3rem", justifyContent: "center" }}
        >
          <button
            type="button"
            className="trip-form-btn trip-form-btn--ghost"
            onClick={() => navigate(`/trips/${tripId}/planning`)}
            style={{ width: "200px" }}
          >
            חזרה לתכנון הטיול
          </button>
        </div>
      </main>
    </>
  );
}
