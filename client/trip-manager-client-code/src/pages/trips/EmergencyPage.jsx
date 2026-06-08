import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import Navbar from "../../components/Navbar.jsx";
import "./EmergencyPage.css";

export default function EmergencyPage() {
  const { tripId } = useParams();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emergencyTypeId: "1",
    description: "",
  });

  useEffect(() => {
    fetchEmergencies();
  }, [tripId]);

  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/trips/${tripId}/emergency`);
      setEmergencies(response.data);
    } catch (err) {
      console.error("Error fetching emergencies:", err);
      setError("שגיאה בטעינת אירועי החירום.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitEmergency = async (lat, lng) => {
    setIsSubmitting(true);
    try {
      await api.post(`/api/trips/${tripId}/emergency`, {
        emergencyTypeId: parseInt(formData.emergencyTypeId),
        description: formData.description,
        locationLat: lat,
        locationLng: lng,
      });
      setFormData({ emergencyTypeId: "1", description: "" });
      fetchEmergencies(); // רענון הרשימה לאחר דיווח מוצלח
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

    // דגימת מיקום המשתמש לפני השליחה לשרת
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          submitEmergency(position.coords.latitude, position.coords.longitude);
        },
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

  const handleCloseEmergency = async (emergencyId) => {
    if (!window.confirm("האם אתה בטוח שברצונך לסגור אירוע חירום זה?")) return;

    try {
      await api.put(`/api/trips/${tripId}/emergency/${emergencyId}/close`, {
        status: "closed",
        description: "האירוע נסגר על ידי מנהל/אחראי טיול",
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
            <span className="alert-icon">🚨</span> מצב חירום — טיול {tripId}
          </h1>
          <button
            className="trip-form-btn trip-form-btn--ghost"
            onClick={() => navigate(`/trips/${tripId}/day`)}
          >
            חזרה ליום הטיול
          </button>
        </div>

        {error && <p className="error form-submit-error">{error}</p>}

        <div className="emergency-content">
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
                <option value="1">🟢 קל (פציעה קלה, עיכוב זמני)</option>
                <option value="2">🟠 בינוני (נדרש חילוץ / פינוי רפואי)</option>
                <option value="3">🔴 קריטי (סכנת חיים / אירוע ביטחוני)</option>
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

          <section className="form-section emergency-history-section">
            <h2 className="form-section-title">היסטוריית אירועים בטיול</h2>
            {loading ? (
              <p>טוען נתונים...</p>
            ) : emergencies.length === 0 ? (
              <p className="no-emergencies">
                לא דווחו אירועי חירום בטיול זה. 🙏
              </p>
            ) : (
              <ul className="emergencies-list">
                {emergencies.map((em) => (
                  <li
                    key={em.id}
                    className={`emergency-card ${em.status === "open" ? "card-open" : "card-closed"}`}
                  >
                    <div className="emergency-card-header">
                      <span className="emergency-status-badge">
                        {em.status === "open"
                          ? "🔴 אירוע פעיל"
                          : "🟢 טופל ונסגר"}
                      </span>
                      <span className="emergency-time">
                        {new Date(em.opened_at).toLocaleString("he-IL")}
                      </span>
                    </div>
                    <p className="emergency-desc">{em.description}</p>
                    {em.location_lat && (
                      <p className="emergency-location">
                        📍 נ.צ: {em.location_lat.toFixed(4)},{" "}
                        {em.location_lng.toFixed(4)}
                      </p>
                    )}
                    {em.status === "open" && (
                      <button
                        className="trip-form-btn trip-form-btn--primary btn-close-emergency"
                        onClick={() => handleCloseEmergency(em.id)}
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
