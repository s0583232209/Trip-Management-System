import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import "./TripsPage.css";
import "./TripForms.css";

const STOP_TYPES = [
  { value: "מסלול הליכה", label: "מסלול הליכה" },
  { value: "גינה לעצירה", label: "גינה לעצירה" },
  { value: "אטרקציה", label: "אטרקציה" },
];

const TRAIL_CONDITIONS = [
  { value: "יבש", label: "יבש" },
  { value: "רטוב", label: "רטוב" },
];

function StopForm({ stop, index, onChange, onRemove }) {
  function handleField(e) {
    const { name, value } = e.target;
    onChange(index, { ...stop, [name]: value });
  }

  return (
    <div className="stop-card">
      <div className="stop-card-header">
        <span className="stop-index">עצירה {index + 1}</span>
        <button
          type="button"
          className="stop-remove-btn"
          onClick={() => onRemove(index)}
        >
          הסר
        </button>
      </div>

      <label>שם העצירה</label>
      <input
        type="text"
        name="name"
        required
        placeholder="*"
        value={stop.name}
        onChange={handleField}
      />

      <label>סוג העצירה</label>
      <select name="type" value={stop.type} onChange={handleField} required>
        <option value="">בחר סוג</option>
        {STOP_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {stop.type === "מסלול הליכה" && (
        <>
          <label>מצב המסלול</label>
          <select
            name="trailCondition"
            value={stop.trailCondition || ""}
            onChange={handleField}
            required
          >
            <option value="">בחר מצב</option>
            {TRAIL_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </>
      )}

      {stop.type === "אטרקציה" && (
        <>
          <label>
            אישור רשמי <span className="required-badge">חובה</span>
          </label>
          <input
            type="text"
            name="officialApproval"
            placeholder="מספר אישור / גורם מאשר *"
            required
            value={stop.officialApproval || ""}
            onChange={handleField}
          />
          <p className="field-hint">
            אטרקציה חייבת לכלול אישור רשמי מגורם מוסמך
          </p>
        </>
      )}

      <label>הערות (אופציונלי)</label>
      <input
        type="text"
        name="notes"
        placeholder="הערות נוספות"
        value={stop.notes || ""}
        onChange={handleField}
      />
    </div>
  );
}

const emptyStop = () => ({
  name: "",
  type: "",
  trailCondition: "",
  officialApproval: "",
  notes: "",
});

export default function CreateTripPage() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("current-user")) || {};

  const [formData, setFormData] = useState({
    title: "",
    tripDate: "",
    tripLeaderId: "",
    status: "מתוכנן",
  });

  const [stops, setStops] = useState([emptyStop()]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function updateStop(index, updatedStop) {
    setStops((prev) => prev.map((s, i) => (i === index ? updatedStop : s)));
  }

  function removeStop(index) {
    setStops((prev) => prev.filter((_, i) => i !== index));
  }

  function addStop() {
    setStops((prev) => [...prev, emptyStop()]);
  }

  function validate() {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "שם הטיול הוא שדה חובה";
    if (!formData.tripDate) newErrors.tripDate = "תאריך הטיול הוא שדה חובה";
    if (!formData.tripLeaderId.trim())
      newErrors.tripLeaderId = "מספר ת.ז. של אחראי הטיול הוא שדה חובה";

    stops.forEach((stop, i) => {
      if (!stop.name.trim())
        newErrors[`stop_${i}_name`] = `שם עצירה ${i + 1} חסר`;
      if (!stop.type) newErrors[`stop_${i}_type`] = `סוג עצירה ${i + 1} חסר`;
      if (stop.type === "מסלול הליכה" && !stop.trailCondition)
        newErrors[`stop_${i}_condition`] = `מצב מסלול עצירה ${i + 1} חסר`;
      if (stop.type === "אטרקציה" && !stop.officialApproval?.trim())
        newErrors[`stop_${i}_approval`] = `אישור רשמי עצירה ${i + 1} חסר`;
    });

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const routeGeoJson = JSON.stringify({ stops });

      const payload = {
        title: formData.title,
        tripDate: formData.tripDate,
        tripLeaderId: formData.tripLeaderId,
        status: formData.status,
        routeGeoJson,
      };

      const response = await api.post("/api/trips", payload);
      navigate(`/trips/${response.data.insertId || response.data.id || ""}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.response?.data ||
          "יצירת הטיול נכשלה, נסה שנית",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">יצירת טיול חדש</h1>

        <form className="trip-form" onSubmit={handleSubmit} noValidate>
          {/* ── Trip meta ── */}
          <section className="form-section">
            <h2 className="form-section-title">פרטי הטיול</h2>

            <label>שם הטיול</label>
            <input
              type="text"
              name="title"
              placeholder="*"
              required
              value={formData.title}
              onChange={updateField}
            />
            {errors.title && <p className="error">{errors.title}</p>}

            <label>תאריך הטיול</label>
            <input
              type="date"
              name="tripDate"
              required
              value={formData.tripDate}
              onChange={updateField}
            />
            {errors.tripDate && <p className="error">{errors.tripDate}</p>}

            <label>מספר ת.ז. של אחראי הטיול</label>
            <input
              type="text"
              name="tripLeaderId"
              placeholder="9 ספרות *"
              required
              value={formData.tripLeaderId}
              onChange={updateField}
            />
            {errors.tripLeaderId && (
              <p className="error">{errors.tripLeaderId}</p>
            )}

            <label>סטטוס ראשוני</label>
            <select
              name="status"
              value={formData.status}
              onChange={updateField}
            >
              <option value="מתוכנן">מתוכנן</option>
              <option value="בהמתנה לאישור">בהמתנה לאישור</option>
            </select>
          </section>

          {/* ── Stops / Route ── */}
          <section className="form-section">
            <h2 className="form-section-title">מסלול הטיול — עצירות</h2>
            <p className="form-section-hint">
              הוסף את כל העצירות לפי הסדר. לכל עצירה יש לציין שם וסוג. סוגי
              האטרקציה דורשים אישור רשמי; מסלולי הליכה דורשים ציון מצב המסלול.
            </p>

            {stops.map((stop, i) => (
              <StopForm
                key={i}
                stop={stop}
                index={i}
                onChange={updateStop}
                onRemove={removeStop}
              />
            ))}

            {/* per-stop errors summary */}
            {Object.keys(errors)
              .filter((k) => k.startsWith("stop_"))
              .map((k) => (
                <p key={k} className="error">
                  {errors[k]}
                </p>
              ))}

            <button type="button" className="add-stop-btn" onClick={addStop}>
              + הוסף עצירה
            </button>
          </section>

          {submitError && (
            <p className="error form-submit-error">{submitError}</p>
          )}

          <div className="form-actions-row">
            <button
              type="button"
              className="trip-form-btn trip-form-btn--ghost"
              onClick={() => navigate("/trips")}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="trip-form-btn trip-form-btn--primary"
              disabled={loading}
            >
              {loading ? "שומר..." : "צור טיול"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
