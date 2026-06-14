import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import StaffContactsView from "../staff/StaffContactsView.jsx";
import useTripTitle from "../../../hooks/useTripTitle.js";
import "../TripsPage.css";
import "../TripForms.css";

export default function TripContactsPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const tripTitle = useTripTitle(tripId);

  return (
    <>
      <Navbar />
      <main className="page-main contacts-page-main">
        <h1 className="page-title contacts-page-title">
          אנשי קשר — טיול {tripTitle}
        </h1>
        <StaffContactsView readOnly />
        <div className="contacts-back-row">
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate(`/trips/${tripId}/day`)}>
            חזרה ליום הטיול
          </button>
        </div>
      </main>
    </>
  );
}
