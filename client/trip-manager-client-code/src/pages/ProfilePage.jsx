import Navbar from "../components/Navbar.jsx";
import InfoPopup from "../components/InfoPopup.jsx";
import "./trips/TripsPage.css";

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">פרופיל</h1>
        <p>הפרופיל שלך</p>

        <div className="trips-cards">
          <div className="trip-card">
            <InfoPopup inline />
          </div>
        </div>
      </main>
    </>
  );
}
