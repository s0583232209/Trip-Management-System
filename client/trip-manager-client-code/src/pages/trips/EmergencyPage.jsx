import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../../api";
import Navbar from "../../components/Navbar.jsx";
import { canHandleMinorEmergency, canHandleCriticalEmergency, getUser } from "../../permissions.js";
import "./EmergencyPage.css";
import socket from "../../socket.js";
import { muteEmergencySound } from "../../store/emergencySlice.js";

export default function EmergencyPage() {
  const { tripId } = useParams();
  const dispatch = useDispatch();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripDate, setTripDate] = useState(null);
  const [tripLeaderId, setTripLeaderId] = useState(null);
  const [tripTitle, setTripTitle] = useState("");
  const [isRinging, setIsRinging] = useState(false);
  const navigate = useNavigate();

  const ringTimerRef = useRef(null);

  const canMinor = canHandleMinorEmergency(tripDate, tripLeaderId);
  const canCritical = canHandleCriticalEmergency(tripDate, tripLeaderId);
  const canReport = canMinor || canCritical;

  const allowedTypes = [
    ...(canMinor ? [{ value: "1", label: "🟡 קל (פציעה קלה, עיכוב זמני)" }] : []),
    ...(canCritical ? [{ value: "2", label: "🔴 קריטי (נדרש חילוץ / פינוי רפואי)" }] : []),
  ];

  const [formData, setFormData] = useState({ emergencyTypeId: "1", description: "" });

  function startAlarm() {
    setIsRinging(true);
    clearTimeout(ringTimerRef.current);
    ringTimerRef.current = setTimeout(() => stopAlarm(), 30000);
  }

  function stopAlarm() {
    clearTimeout(ringTimerRef.current);
    ringTimerRef.current = null;
    setIsRinging(false);
    dispatch(muteEmergencySound());
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
          setTripLeaderId(trip.trip_leader_id);
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

    function handleEmergencyAlert(data) {
      setEmergencies((prev) => [data.emergency, ...prev]);
      startAlarm();
    }

    function handleEmergencyClosed({ emergencyId, closedAt }) {
      setEmergencies((prev) =>
        prev.map((em) =>
          em.id === emergencyId ? { ...em, status: 2, closed_at: closedAt || new Date().toISOString() } : em
        )
      );
    }

    socket.on("emergency-alert", handleEmergencyAlert);
    socket.on("emergency-closed", handleEmergencyClosed);

    return () => {
      socket.off("emergency-alert", handleEmergencyAlert);
      socket.off("emergency-closed", handleEmergencyClosed);
      clearTimeout(ringTimerRef.current);
    };
  }, [tripId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitEmergency = async (lat, lng) => {
    setIsSubmitting(true);
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
      if (parseInt(formData.emergencyTypeId) === 2) {
        navigate(`/trips/${tripId}/emergencies/critical`);
      }
    } catch (err) {
      console.error("Error creating emergency:", err);
      setError("אירעה שגיאה בדיווח על מצב החירום.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportEmergency = (e) => {
    e.preventDefault();
    if (!formData.description) { alert("יש להזין תיאור לאירוע"); return; }
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
    if (isCritical && !canCritical) { alert("סגירת חירום קריטי מותרת לאחראי טיול ביום הטיול בלבד."); return; }
    if (!isCritical && !canMinor) { alert("אין לך הרשאה לסגור אירוע חירום."); return; }

    try {
      await api.put(`/api/trips/${tripId}/emergencies/${emergency.id}/close`, { status: 2 });
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
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate(`/trips/${tripId}/day`)}>
            חזרה ליום הטיול
          </button>
        </div>

        {isRinging && (
          <div className="alarm-banner">
            <span>🚨 אזעקת חירום פעילה!</span>
            <button className="alarm-stop-btn" onClick={stopAlarm}>
              🔕 השתק אזעקה
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
                    <option key={t.value} value={t.value}>{t.label}</option>
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
                />

                <button type="submit" disabled={isSubmitting} className="trip-form-btn trip-form-btn--danger">
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
                    className={`emergency-card ${em.status === 1 ? "card-open" : "card-closed"} ${em.emergency_type_id === 2 ? "card-critical" : "card-minor"}`}
                  >
                    <div className="emergency-card-header">
                      <span className="emergency-type-badge">
                        {em.emergency_type_id === 2 ? "🔴 קריטי" : "🟡 קל"}
                      </span>
                      <span className="emergency-status-badge">
                        {em.status === 1 ? "⚠️ פעיל" : "✅ נסגר"}
                      </span>
                    </div>
                    <p className="emergency-desc">{em.description}</p>
                    <div className="emergency-meta">
                      <span>🕐 נפתח: {new Date(em.opened_at).toLocaleString("he-IL")}</span>
                      {em.opened_by_name && <span>👤 {em.opened_by_name}</span>}
                    </div>
                    {em.status === 2 && em.closed_at && (
                      <div className="emergency-meta emergency-closed-meta">
                        <span>🔒 נסגר: {new Date(em.closed_at).toLocaleString("he-IL")}</span>
                      </div>
                    )}
                    {em.location_lat && (
                      <p className="emergency-location">
                        📍{" "}
                        <a
                          href={`https://maps.google.com/?q=${em.location_lat},${em.location_lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#0288d1" }}
                        >
                          {Number(em.location_lat).toFixed(5)}, {Number(em.location_lng).toFixed(5)}
                        </a>
                      </p>
                    )}
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
