import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import StaffContactsView from "./StaffContactsView.jsx";
import "./TripsPage.css";

export default function TripContactsPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <h1 className="page-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
          אנשי קשר לטיול {tripId}
        </h1>
        <StaffContactsView />
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate(`/trips/${tripId}`)}>
            חזרה
          </button>
        </div>
      </main>
    </>
  );
}
