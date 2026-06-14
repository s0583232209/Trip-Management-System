import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import videoSrc from "../assets/critical_emegency_video.mp4";

export default function CriticalEmergency() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ maxWidth: 860 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            borderBottom: "2px solid #ffcdd2",
            paddingBottom: "1rem",
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#c62828",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: 0,
            }}
          >
            <span
              style={{
                animation: "pulse 1.5s infinite",
                display: "inline-block",
              }}
            >
              🚨
            </span>
            חירום קריטי — נהלי חירום
          </h1>
          <button
            className="trip-form-btn trip-form-btn--ghost"
            onClick={() => navigate(`/trips/${tripId}/emergencies`)}
          >
            ← חזרה לדף חירום
          </button>
        </div>

        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #ffcdd2",
            borderRight: "5px solid #d32f2f",
            borderRadius: 10,
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: "#c62828",
              marginBottom: "0.75rem",
            }}
          >
            🔴 בוצע דיווח על אירוע קריטי — יש לפעול מיידית לפי הנחיות הוידאו
          </p>
          <ul
            style={{
              paddingRight: "1.25rem",
              lineHeight: 2,
              color: "#333",
              fontSize: 15,
            }}
          >
            <li>הודע למנהל בית הספר ולרכז הטיולים</li>
            <li>
              פתח אירוע חירום באפליקצית מוקד טבע או התקשר לחדר מצב:{" "}
              <strong>02-6223360</strong>
               <strong>*9267</strong>
            </li>
            <li>
              {" "}
              התקשר למד"א במקרה הצורך : <strong>101</strong>
            </li>
            <li>
              התקשר למשטרה במקרה הצורך: <strong>100</strong>
            </li>
            <li>
              התקשר לכוחות הכבאות וההצלה במקרה הצורך: <strong>102</strong>
            </li>
            <li>אל תזוז מהמקום עד להגעת גורמי חירום</li>
            <li>מנע פאניקה — הרגע את שאר הקבוצה</li>
          </ul>
        </div>

        <section
          style={{
            background: "var(--surface)",
            borderRadius: 10,
            boxShadow: "var(--shadow)",
            padding: "1.5rem",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--sky-dark)",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "2px solid var(--sky-light)",
            }}
          >
            📽 סרטון נהלי חירום
          </h2>
          <video
            ref={(el) => {
              if (el) setTimeout(() => el.play(), 1000);
            }}
            src={videoSrc}
            controls
            style={{ width: "100%", borderRadius: 8, background: "#000" }}
          />
        </section>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            className="trip-form-btn trip-form-btn--danger"
            style={{ padding: "0.85rem 3rem", fontSize: 16 }}
            onClick={() => navigate(`/trips/${tripId}/emergencies`)}
          >
            חזרה לניהול אירועי החירום
          </button>
        </div>
      </main>
    </>
  );
}
