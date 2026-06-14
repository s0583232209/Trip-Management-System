import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../api.js";
import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar.jsx";
import { canManageTrip } from "../../../permissions.js";
import "../TripsPage.css";

export default function TripSelectionPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  useEffect(()=> {
    async function getTrips() {
      const trips = await api.get("/api/trips");
      // console.log(trips);
      setTrips(trips.data);
    };
    getTrips();
  }, []);
  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">בחר טיול</h1>
        <p>
          בחר את הטיול הרלוונטי כדי להמשיך לניווט ולניהול של תכנון ויום הטיול.
        </p>
        <div className="trips-cards">
          {trips.map((trip) => (
            <button
              key={trip.id}
              className="trip-card"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              {trip.title}
            </button>
          ))}
        </div>
        <br />
        <div>
          {canManageTrip() && (
            <button className="trip-card" onClick={() => navigate(`/trips/new`)}>
              יצירת טיול חדש
            </button>
          )}
        </div>
      </main>
    </>
  );
}
