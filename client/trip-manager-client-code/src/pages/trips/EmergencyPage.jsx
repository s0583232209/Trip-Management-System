import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar.jsx";
import { canHandleMinorEmergency, canHandleCriticalEmergency, getUser } from "../../permissions.js";
import "./EmergencyPage.css";
import socket from "../../socket.js";

export default function EmergencyPage() {
  const { tripId } = useParams();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripDate, setTripDate] = useState(null);
  const [tripTitle, setTripTitle] = useState("");
  const [isRinging, setIsRinging] = useState(false);
  const navigate = useNavigate();

  const intervalRef = useRef(null);
  const ringTimerRef = useRef(null);
  const audioCtxRef = useRef(null);

  // canMinor/canCritical/canReport/allowedTypes — all at component scope
  const canMinor = canHandleMinorEmergency();
  const canCritical = canHandleCriticalEmergency(tripDate);
  const canReport = canMinor || canCritical;

  const allowedTypes = [
    ...(canMinor ? [{ value: "1", label: "🟢 קל (פציעה קלה, עיכוב זמני)" }] : []),
    ...(canCritical ? [{ value: "2", label: "🔴 קריטי (נדרש חילוץ / פינוי רפואי)" }] : []),
  ];

  const [formData, setFormData] = useState({
    emergencyTypeId: "1",
    description: "",
  });

  // Initialize AudioContext on first user interaction (browser autoplay policy)
  useEffect(() => {
    function initAudio() {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
      document.removeEventListener("touchstart", initAudio);
    }
    document.addEventListener("click", initAudio);
    document.addEventListener("keydown", initAudio);
    document.addEventListener("touchstart", initAudio);
    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
      document.removeEventListener("touchstart", initAudio);
    };
  }, []);

  function beep() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(550, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  }

  function startAlarm() {
    beep();
    intervalRef.current = setInterval(beep, 700);
    setIsRinging(true);
    clearTimeout(ringTimerRef.current);
    ringTimerRef.current = setTimeout(() => stopAlarm(), 30000);
  }

  function stopAlarm() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    clearTimeout(ringTimerRef.current);
    setIsRinging(false);
  }

  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/trips/${tripId}/emergencies`);
      setEmergencies(response.data);
    } catch (err) {
      console.error("Error fetching emergencies:", err);
      setError("שגיאה בטעינת אירועי החירום.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      await fetchEmergencies();
      try {
        const res = await api.get(`/api/trips/${tripId}`);
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (trip) {
          setTripDate(trip.trip_date);
          setTripTitle(trip.title);
        }
      } catch (err) {
        console.error("Error fetching trip:", err);
      }
    }
    init();
  }, [tripId]);

  useEffect(() => {
    socket.emit("join-trip", tripId);

    // שומרים רפרנס לפונקציות ה-handler כדי שה-cleanup יסיר רק את המאזינים
    // שנרשמו כאן, ולא ימחק מאזינים שרשמו קומפוננטות אחרות (socket הוא singleton משותף)
    function handleEmergencyAlert(data) {
      setEmergencies((prev) => [data.emergency, ...prev]);
      startAlarm();
    }

    function handleEmergencyClosed({ emergencyId }) {
      setEmergencies((prev) =>
        prev.map((em) => (em.id === emergencyId ? { ...em, status: 2 } : em))
      );
    }

    socket.on("emergency-alert", handleEmergencyAlert);
    socket.on("emergency-closed", handleEmergencyClosed);

    return () => {
      socket.emit("leave-trip", tripId);
      socket.off("emergency-alert", handleEmergencyAlert);
      socket.off("emergency-closed", handleEmergencyClosed);
      stopAlarm();
    };
  }, [tripId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitEmergency = async (lat, lng) => {
    setIsSubmitting(true);
    stopAlarm();
    try {
      await api.post(`/api/trips/${tripId}/emergencies`, {
        emergencyTypeId: parseInt(formData.emergencyTypeId),
        description: formData.description,
        locationLat: lat,
        locationLng: lng,
        status: 1,
      });
      setFormData({ emergencyTypeId: allowedTypes[0]?.value || "1", description: "" });
      fetchEmergencies();
    } catch (err) {
      console.error("Error creating emergency:", err);
      setError("אירעה שגיאה בדיווח על מצב החירום.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportEmergency = (e) => {
    e.preventDefault();
    if (!formData.description) {
      alert("יש להזין תיאור לאירוע");
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => submitEmergency(position.coords.latitude, position.coords.longitude),
        (err) => {
          console.warn("Geolocation denied or error:", err);
          alert("לא הצלחנו לקבל את המיקום שלך. הדיווח יישלח ללא מיקום מדויק.");
          submitEmergency(null, null);
        },
      );
    } else {
      submitEmergency(null, null);
    }
  };

  const handleCloseEmergency = async (emergency) => {
    if (!window.confirm("האם אתה בטוח שברצונך לסגור אירוע חירום זה?")) return;

    const isCritical = emergency.emergency_type_id === 2;
    if (isCritical && !canCritical) {
      alert("סגירת חירום קריטי מותרת לאחראי טיול ביום הטיול בלבד.");
      return;
    }
    if (!isCritical && !canMinor) {
      alert("אין לך הרשאה לסגור אירוע חירום.");
      return;
    }

    try {
      await api.put(`/api/trips/${tripId}/emergencies/${emergency.id}/close`, {
        status: 2,
        description: "האירוע נסגר על ידי אחראי טיול/מורה",
      });
      fetchEmergencies();
    } catch (err) {
      console.error("Error closing emergency:", err);
      alert("שגיאה בסגירת האירוע");
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="emergency-header">
          <h1 className="page-title emergency-title">
            <span className="alert-icon">🚨</span> מצב חירום — טיול {tripTitle || tripId}
          </h1>
          <button
            className="trip-form-btn trip-form-btn--ghost"
            onClick={() => navigate(`/trips/${tripId}/day`)}
          >
            חזרה ליום הטיול
          </button>
        </div>

        {isRinging && (
          <div className="alarm-banner">
            <span>🚨 אזעקת חירום פעילה!</span>
            <button className="alarm-stop-btn" onClick={stopAlarm}>
              עצור אזעקה
            </button>
          </div>
        )}

        {error && <p className="error form-submit-error">{error}</p>}

        <div className="emergency-content">
          {canReport && (
            <section className="form-section emergency-form-section">
              <h2 className="form-section-title">דיווח על אירוע חדש</h2>
              <form onSubmit={handleReportEmergency} className="trip-form">
                <label htmlFor="emergencyTypeId">רמת חומרה</label>
                <select
                  id="emergencyTypeId"
                  name="emergencyTypeId"
                  value={formData.emergencyTypeId}
                  onChange={handleInputChange}
                  className="emergency-select"
                >
                  {allowedTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <label htmlFor="description">תיאור האירוע</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="פרט מה קרה, מי מעורב, ומה מצב הנפגעים..."
                  className="emergency-textarea"
                ></textarea>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="trip-form-btn trip-form-btn--danger"
                >
                  {isSubmitting ? "שולח דיווח..." : "🚨 דווח עכשיו (כולל נ.צ)"}
                </button>
              </form>
            </section>
          )}

          <section className="form-section emergency-history-section">
            <h2 className="form-section-title">היסטוריית אירועים בטיול</h2>
            {loading ? (
              <p>טוען נתונים...</p>
            ) : emergencies.length === 0 ? (
              <p className="no-emergencies">לא דווחו אירועי חירום בטיול זה. 🙏</p>
            ) : (
              <ul className="emergencies-list">
                {emergencies.map((em) => (
                  <li
                    key={em.id}
                    className={`emergency-card ${em.status === 1 ? "card-open" : "card-closed"}`}
                  >
                    <div className="emergency-card-header">
                      <span className="emergency-status-badge">
                        {em.status === 1 ? "🔴 אירוע פעיל" : "🟢 טופל ונסגר"}
                      </span>
                      <span className="emergency-time">
                        {new Date(em.opened_at).toLocaleString("he-IL")}
                      </span>
                    </div>
                    <p className="emergency-desc">{em.description}</p>
                    {em.location_lat && <p className="emergency-location"></p>}
                    {em.status === 1 && (em.emergency_type_id === 1 ? (canMinor || canCritical) : canCritical && em.opened_by === getUser().userId) && (
                      <button
                        className="trip-form-btn trip-form-btn--primary btn-close-emergency"
                        onClick={() => handleCloseEmergency(em)}
                      >
                        ✓ סמן כטופל (סגור אירוע)
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
