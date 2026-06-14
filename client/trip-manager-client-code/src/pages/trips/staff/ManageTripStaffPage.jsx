import { useState, useRef } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import AddTripTeachers from "./AddTripTeachers.jsx";
import AddTripExternalStaff from "./AddExternalStaff.jsx";
import StaffContactsView from "./StaffContactsView.jsx";
import { canManageTrip } from "../../../permissions.js";
import useTripTitle from "../../../hooks/useTripTitle.js";
import "../TripsPage.css";
import "../TripForms.css";

export default function ManageTripStaffPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const tripTitle = useTripTitle(tripId);
  const refreshRef = useRef(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddExternal, setShowAddExternal] = useState(false);

  if (!canManageTrip()) return <Navigate to="/unauthorized" replace />;

  function handleSuccess() {
    if (refreshRef.current) refreshRef.current();
    setShowAddTeacher(false);
    setShowAddExternal(false);
  }

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <h1 className="page-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          ניהול צוות טיול {tripTitle || tripId}
        </h1>

        <StaffContactsView onRefresh={refreshRef} />

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "2rem 0 1rem" }}>
          <button
            className="trip-form-btn trip-form-btn--primary"
            onClick={() => { setShowAddTeacher((v) => !v); setShowAddExternal(false); }}
          >
            {showAddTeacher ? "סגור" : "+ הוסף מורה"}
          </button>
          <button
            className="trip-form-btn trip-form-btn--primary"
            onClick={() => { setShowAddExternal((v) => !v); setShowAddTeacher(false); }}
          >
            {showAddExternal ? "סגור" : "+ הוסף צוות חיצוני"}
          </button>
        </div>

        {showAddTeacher && (
          <div style={{ marginBottom: "2rem" }}>
            <AddTripTeachers onSuccess={handleSuccess} />
          </div>
        )}
        {showAddExternal && (
          <div style={{ marginBottom: "2rem" }}>
            <AddTripExternalStaff onSuccess={handleSuccess} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate(`/trips/${tripId}/planning`)}>
            חזרה לתכנון הטיול
          </button>
        </div>
      </main>
    </>
  );
}
