import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import "./TripsPage.css";

const sampleTrips = [
  { id: "101", name: "טיול חורף ליער" },
  { id: "102", name: "טיול מדע במוזיאון" },
  { id: "103", name: "טיול סוף שנה" },
];

export default function TripSelectionPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">בחר טיול</h1>
        <p>בחר את הטיול הרלוונטי כדי להמשיך לניווט ולניהול של תכנון ויום הטיול.</p>
        <div className="trips-cards">
          {sampleTrips.map((trip) => (
            <button
              key={trip.id}
              className="trip-card"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              {trip.name}
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
