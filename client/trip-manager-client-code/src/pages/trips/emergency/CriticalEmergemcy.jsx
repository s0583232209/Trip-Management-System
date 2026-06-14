import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import videoSrc from "../../../assets/critical_emegency_video.mp4";
import "./EmergencyPage.css";
import "../TripForms.css";
import "../TripsPage.css";

export default function CriticalEmergency() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  return (
    <>
      <Navbar />
      <main className="page-main critical-page">
        <div className="emergency-header">
          <h1 className="page-title emergency-title">
            <span className="alert-icon">🚨</span>
            חירום קריטי — נהלי חירום
          </h1>
          <button
            className="trip-form-btn trip-form-btn--ghost"
            onClick={() => navigate(`/trips/${tripId}/emergencies`)}
          >
            ← חזרה לדף חירום
          </button>
        </div>

        <div className="critical-alert-box">
          <p className="critical-alert-title">
            🔴 בוצע דיווח על אירוע קריטי — יש לפעול מיידית לפי ההנחיות
          </p>
          <ul className="critical-steps-list">
            <li>הודע למנהל בית הספר ולרכז הטיולים</li>
            <li>פתח אירוע חירום באפליקצית מוקד טבע או התקשר לחדר מצב: <strong>02-6223360</strong></li>
            <li>התקשר למד"א במקרה הצורך: <strong>101</strong></li>
            <li>התקשר למשטרה במקרה הצורך: <strong>100</strong></li>
            <li>אל תזוז מהמקום עד להגעת גורמי חירום</li>
            <li>מנע פאניקה — הרגע את שאר הקבוצה</li>
          </ul>
        </div>

        <section className="form-section critical-video-section">
          <h2 className="form-section-title">📽 סרטון נהלי חירום</h2>
          <video
            ref={(el) => { if (el) setTimeout(() => el.play(), 1000); }}
            src={videoSrc}
            controls
            className="critical-video"
          />
        </section>

        <div className="critical-back-row">
          <button
            className="trip-form-btn trip-form-btn--danger critical-back-btn"
            onClick={() => navigate(`/trips/${tripId}/emergencies`)}
          >
            חזרה לניהול אירועי החירום
          </button>
        </div>
      </main>
    </>
  );
}
