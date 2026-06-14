import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import api from "../../../api.js";
import { canManageTrip, canSetPostEdit, TRIP_STATUS, TRIP_STATUS_LABEL } from "../../../permissions.js";
import "../TripsPage.css";
import "../TripForms.css";

export default function TripStatusPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [postEditNote, setPostEditNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchTrip(); }, [tripId]);

  async function fetchTrip() {
    try {
      const res = await api.get(`/api/trips/${tripId}`);
      const t = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!t) navigate("/not-found", { replace: true });
      else setTrip(t);
    } catch {
      navigate("/not-found", { replace: true });
    }
  }

  async function doAction(url, body = {}) {
    setError(""); setSuccess(""); setLoading(true);
    try {
      await api.put(url, body);
      await fetchTrip();
      setSuccess("הסטטוס עודכן בהצלחה");
    } catch (err) {
      setError(err.response?.data?.message || "הפעולה נכשלה, נסה שנית");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    await doAction(`/api/trips/${tripId}/approve`);
  }

  async function handleClose() {
    if (!window.confirm("האם לסמן את הטיול כ'עבר'? לא ניתן לערוך לאחר מכן ללא הרשאת מנהל.")) return;
    await doAction(`/api/trips/${tripId}/close`);
  }

  async function handlePostEdit(e) {
    e.preventDefault();
    if (!postEditNote.trim()) { setError("יש להזין הערת סיבה"); return; }
    await doAction(`/api/trips/${tripId}/post-edit`, { note: postEditNote });
    setPostEditNote("");
  }

  if (!trip) return <><Navbar /><main className="page-main"><p>טוען...</p></main></>;

  const status = trip.trip_status;
  const statusLabel = TRIP_STATUS_LABEL[status] || "לא מוגדר";

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="kit-page-header">
          <div>
            <h1 className="page-title">סטטוס טיול — {trip.title}</h1>
            <p className="form-section-hint">
              סטטוס נוכחי: <strong>{statusLabel}</strong>
            </p>
          </div>
          <button className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate(`/trips/${tripId}`)}>
            חזרה לטיול
          </button>
        </div>

        {/* פס סטטוס */}
        <div style={{ display: "flex", gap: "0.5rem", margin: "1.5rem 0", flexWrap: "wrap" }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              flex: 1, minWidth: 80, textAlign: "center", padding: "0.5rem",
              borderRadius: 8, fontWeight: status === s ? "bold" : "normal",
              background: status === s ? "#2563eb" : status > s ? "#d1fae5" : "#f3f4f6",
              color: status === s ? "#fff" : status > s ? "#065f46" : "#6b7280",
              border: `2px solid ${status === s ? "#2563eb" : status > s ? "#10b981" : "#e5e7eb"}`,
            }}>
              {TRIP_STATUS_LABEL[s]}
            </div>
          ))}
          {status === TRIP_STATUS.POST_EDIT && (
            <div style={{ flex: 1, minWidth: 80, textAlign: "center", padding: "0.5rem", borderRadius: 8, fontWeight: "bold", background: "#fef3c7", color: "#92400e", border: "2px solid #f59e0b" }}>
              {TRIP_STATUS_LABEL[4]}
            </div>
          )}
        </div>

        {error && <p className="error form-submit-error">{error}</p>}
        {success && <p style={{ color: "green", marginBottom: "1rem" }}>{success}</p>}

        <div className="form-section">
          {/* planned → approved */}
          {status === TRIP_STATUS.PLANNED && canManageTrip() && (
            <div style={{ marginBottom: "1rem" }}>
              <h2 className="form-section-title">אישור הטיול</h2>
              <p className="form-section-hint">אישור הטיול ינעל עריכת פרטים קריטיים ויפיק קוד לחתימת הורים.</p>
              <button className="trip-form-btn trip-form-btn--primary" onClick={handleApprove} disabled={loading}>
                {loading ? "מבצע..." : "אשר טיול"}
              </button>
            </div>
          )}

          {/* approved → done */}
          {status === TRIP_STATUS.APPROVED && canManageTrip() && (
            <div style={{ marginBottom: "1rem" }}>
              <h2 className="form-section-title">סגירת הטיול</h2>
              <p className="form-section-hint">סמן את הטיול כ'עבר' לאחר שהסתיים.</p>
              <button className="trip-form-btn trip-form-btn--primary" onClick={handleClose} disabled={loading}>
                {loading ? "מבצע..." : "סגור טיול"}
              </button>
            </div>
          )}

          {/* post-edit → done */}
          {status === TRIP_STATUS.POST_EDIT && canSetPostEdit() && (
            <div style={{ marginBottom: "1rem" }}>
              <h2 className="form-section-title">סגירת הטיול לאחר תיקון</h2>
              <p className="form-section-hint">לאחר סיום העריכה — סגור את הטיול סופית.</p>
              <button className="trip-form-btn trip-form-btn--primary" onClick={handleClose} disabled={loading}>
                {loading ? "מבצע..." : "סגור טיול"}
              </button>
            </div>
          )}

          {/* approved/done → post-edit (מנהל בלבד) */}
          {(status === TRIP_STATUS.APPROVED || status === TRIP_STATUS.DONE) && canSetPostEdit() && (
            <div style={{ marginTop: "1.5rem", background: "#fffbe6", border: "1px solid #f59e0b", borderRadius: 8, padding: "1rem 1.5rem" }}>
              <h2 className="form-section-title">פתיחת תיקון בדיעבד</h2>
              <p className="form-section-hint">פעולה זו תאפשר עריכה מוגבלת. יש לציין סיבה.</p>
              <form onSubmit={handlePostEdit} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input
                  value={postEditNote}
                  onChange={(e) => setPostEditNote(e.target.value)}
                  placeholder='למשל: "הטיול נדחה לבקשת המנהל ביום X"'
                  style={{ flex: 1, minWidth: 220, padding: "0.4rem 0.75rem", borderRadius: 6, border: "1px solid #ccc" }}
                />
                <button type="submit" className="trip-form-btn trip-form-btn--primary" disabled={loading}>
                  {loading ? "שומר..." : "פתח לעריכה"}
                </button>
              </form>
            </div>
          )}

          {status === TRIP_STATUS.DONE && !canSetPostEdit() && (
            <p className="form-section-hint">הטיול הסתיים ונעול לעריכה.</p>
          )}

          {trip.post_edit_note && (
            <div style={{ marginTop: "1rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "0.75rem 1rem" }}>
              <strong>הערת תיקון בדיעבד:</strong> {trip.post_edit_note}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
