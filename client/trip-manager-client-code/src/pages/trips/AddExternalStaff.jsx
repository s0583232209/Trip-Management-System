import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import useTripTitle from "../../hooks/useTripTitle.js";
import "./TripsPage.css";
import "./TripForms.css";

export default function AddTripExternalStaff({ onSuccess } = {}) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const tripTitle = useTripTitle(tripId);

  // Array of objects capturing name, phone, and role for third-party operators
  const [externalStaff, setExternalStaff] = useState([
    { fullName: "", phoneNumber: "", role: "1" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(index, fieldName, value) {
    setExternalStaff((prev) =>
      prev.map((staff, i) =>
        i === index ? { ...staff, [fieldName]: value } : staff,
      ),
    );
  }

  function addField() {
    setExternalStaff((prev) => [
      ...prev,
      { fullName: "", phoneNumber: "", role: "1" },
    ]);
  }

  function removeField(index) {
    setExternalStaff((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation: make sure rows have valid name inputs before posting
    const filledStaff = externalStaff.filter(
      (staff) => staff.fullName.trim() !== "",
    );
    if (filledStaff.length === 0) {
      setError("יש להזין לפחות איש צוות חיצוני אחד עם שם מלא");
      return;
    }

    setLoading(true);
    try {
      // Targets external logistics API route setup
      await api.post(`/api/trips/${tripId}/external-staff`, {
        externalStaff: filledStaff,
      });
      setSuccess("צוות חיצוני נוסף בהצלחה!");
      setExternalStaff([{ fullName: "", phoneNumber: "", role: "guard" }]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "הוספת נותני השירות נכשלה, נסה שנית",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="page-main">
        <h1 className="page-title">
          רישום נותני שירות וצוות חיצוני לטיול {tripTitle || tripId}
        </h1>
        <form className="trip-form" onSubmit={handleSubmit} noValidate>
          <section className="form-section">
            <h2 className="form-section-title">
              צוות אבטחה, רפואה ולוגיסטיקה חיצונית
            </h2>
            <p className="form-section-hint">
              הזן את פרטי אנשי המקצוע החיצוניים המלווים את הטיול לצורכי בטיחות
              וביטחון.
            </p>

            {externalStaff.map((staff, i) => (
              <div
                key={i}
                className="stop-card" // Using stop-card layout styles to encase individual employee entries cleanly
                style={{
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                  borderRadius: "8px",
                }}
              >
                <div
                  className="stop-card-header"
                  style={{ marginBottom: "1rem" }}
                >
                  <span className="stop-index">איש צוות {i + 1}</span>
                  {externalStaff.length > 1 && (
                    <button
                      type="button"
                      className="stop-remove-btn"
                      onClick={() => removeField(i)}
                    >
                      הסר
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <label>שם מלא *</label>
                    <input
                      type="text"
                      placeholder="שם נותן השירות"
                      value={staff.fullName}
                      onChange={(e) =>
                        updateField(i, "fullName", e.target.value)
                      }
                      disabled={loading}
                      required
                    />
                  </div>
                  <div>
                    <label>מספר טלפון</label>
                    <input
                      type="text"
                      placeholder="לדוגמה: 0501234567"
                      value={staff.phoneNumber}
                      onChange={(e) =>
                        updateField(i, "phoneNumber", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  <label>תפקיד / הגדרת שירות</label>
                  <select
                    value={staff.role}
                    onChange={(e) => updateField(i, "role", e.target.value)}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                    }}
                  >
                    <option value="1">מאבטח חמוש</option>
                    <option value="2">חובש מלווה</option>
                    <option value="3">פראמדיק / רופא</option>
                    <option value="4">אחר / מדריך טיולים</option>
                    <option value="5">מע"ר</option>
                  </select>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-stop-btn"
              onClick={addField}
              disabled={loading}
            >
              + הוסף נותן שירות חיצוני
            </button>
          </section>

          {error && <p className="error form-submit-error">{error}</p>}
          {success && (
            <p
              style={{
                color: "green",
                fontWeight: "bold",
                textAlign: "right",
                marginTop: "1rem",
              }}
            >
              {success}
            </p>
          )}

          <div className="form-actions-row">
            <button
              type="button"
              className="trip-form-btn trip-form-btn--ghost"
              onClick={() => navigate(`/trips/${tripId}/planning`)}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="trip-form-btn trip-form-btn--primary"
              disabled={loading}
            >
              {loading ? "שומר..." : "שמור צוות חיצוני"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
