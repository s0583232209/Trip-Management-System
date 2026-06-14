import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import api from "../../../api.js";
import useTripTitle from "../../../hooks/useTripTitle.js";
import "../TripsPage.css";
import "../TripForms.css";

export default function AddTripExternalStaff({ onSuccess } = {}) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const tripTitle = useTripTitle(tripId);

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

    const filledStaff = externalStaff.filter(
      (staff) => staff.fullName.trim() !== "",
    );
    if (filledStaff.length === 0) {
      setError("יש להזין לפחות איש צוות חיצוני אחד עם שם מלא");
      return;
    }

    setLoading(true);
    try {
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
                className="stop-card"
              >
                <div className="stop-card-header">
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

                <div className="external-staff-fields">
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

                <div className="external-staff-role">
                  <label>תפקיד / הגדרת שירות</label>
                  <select
                    value={staff.role}
                    onChange={(e) => updateField(i, "role", e.target.value)}
                    disabled={loading}
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
          {success && <p className="form-success">{success}</p>}

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
