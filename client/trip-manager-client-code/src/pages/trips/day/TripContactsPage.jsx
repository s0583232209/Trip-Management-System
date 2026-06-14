import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import StaffContactsView from "../staff/StaffContactsView.jsx";
import useTripTitle from "../../../hooks/useTripTitle.js";
import "../TripsPage.css";

export default function TripContactsPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const tripTitle = useTripTitle(tripId);

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <h1 className="page-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          אנשי קשר — טיול {tripTitle || tripId}
        </h1>
        <StaffContactsView readOnly />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate(`/trips/${tripId}/day`)}>
            חזרה ליום הטיול
          </button>
        </div>
      </main>
    </>
  );
}
