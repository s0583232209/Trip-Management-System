import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import "./TripsPage.css";
import "./TripForms.css";

export default function ApproveTripPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parentToken, setParentToken] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleApprove() {
    setError("");
    setLoading(true);
    setCopied(false);

    try {
      const response = await api.put(`/api/trips/${tripId}/approve`);
      // על פי ה-service, התשובה מחזירה { parentToken, ...approvedTrip }
      if (response.data && response.data.parentToken) {
        setParentToken(response.data.parentToken);
      } else {
        throw new Error("קוד הורה לא התקבל מהשרת");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "אישור הטיול נכשל, אנא נסה שנית",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCopyToken() {
    if (parentToken) {
      navigator.clipboard.writeText(parentToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">אישור טיול — מזהה {tripId}</h1>

        <div className="trip-form">
          {!parentToken ? (
            <section className="form-section">
              <h2 className="form-section-title">אישור סופי של הטיול במערכת</h2>
              <p className="form-section-hint">
                האם אתה בטוח שברצונך לאשר את טיול מספר <strong>{tripId}</strong>
                ?<br />
                פעולה זו תעביר את סטטוס הטיול למאושר ותפיק קוד ייעודי לחתימת
                הורים.
              </p>

              {error && <p className="error form-submit-error">{error}</p>}

              <div className="form-actions-row" style={{ marginTop: "2rem" }}>
                <button
                  type="button"
                  className="trip-form-btn trip-form-btn--ghost"
                  onClick={() => navigate(`/trips/${tripId}`)}
                  disabled={loading}
                >
                  ביטול וחזרה
                </button>
                <button
                  type="button"
                  className="trip-form-btn trip-form-btn--primary"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? "מבצע אישור..." : "כן, אשר טיול"}
                </button>
              </div>
            </section>
          ) : (
            <section className="form-section">
              <h2 className="form-section-title" style={{ color: "green" }}>
                ✓ הטיול אושר בהצלחה!
              </h2>
              <p className="form-section-hint">
                הסטטוס עודכן ל-2. להלן קוד הגישה (Token) הייחודי עבור חתימות
                ההורים לטיול זה:
              </p>

              <div
                className="stop-card"
                style={{
                  textAlign: "center",
                  backgroundColor: "#f4fcf4",
                  border: "1px solid #c2ecc2",
                  padding: "1.5rem",
                  margin: "1.5rem 0",
                }}
              >
                <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                  קוד לשיתוף עם ההורים:
                </p>
                <code
                  style={{
                    display: "block",
                    wordBreak: "break-all",
                    background: "#fff",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: "1.1rem",
                    fontFamily: "monospace",
                    direction: "ltr",
                  }}
                >
                  {parentToken}
                </code>

                <button
                  type="button"
                  className="trip-form-btn trip-form-btn--primary"
                  style={{
                    marginTop: "1rem",
                    width: "auto",
                    display: "inline-block",
                  }}
                  onClick={handleCopyToken}
                >
                  {copied ? "הועתק!" : "העתק קוד ללוח"}
                </button>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="trip-form-btn trip-form-btn--ghost"
                  onClick={() => navigate(`/trips/${tripId}`)}
                >
                  חזרה לפרטי הטיול
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
