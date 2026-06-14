import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar.jsx";
import api from "../../../api.js";
import "../TripsPage.css";
import "../TripForms.css";
export const STOP_TYPES = [
  { value: "מסלול הליכה", label: "מסלול הליכה" },
  { value: "גינה לעצירה", label: "גינה לעצירה" },
  { value: "אטרקציה", label: "אטרקציה" },
];

export const TRAIL_CONDITIONS = [
  { value: "יבש", label: "יבש" },
  { value: "רטוב", label: "רטוב" },
];

export const emptyStop = () => ({
  name: "",
  type: "",
  trailCondition: "",
  officialApproval: "",
  notes: "",
});

function StopForm({ stop, index, onChange, onRemove, writeAccess }) {
  function handleField(e) {
    const { name, value } = e.target;
    onChange(index, { ...stop, [name]: value });
  }


  return (
    <div className="stop-card">
      <div className="stop-card-header">
        <span className="stop-index">עצירה {index + 1}</span>
        {writeAccess && (
          <button
            type="button"
            className="stop-remove-btn"
            onClick={() => onRemove(index)}
          >
            הסר
          </button>
        )}
      </div>

      <label>שם העצירה</label>
      <input
        type="text"
        name="name"
        required
        placeholder="*"
        value={stop.name || ""}
        onChange={handleField}
        readOnly={!writeAccess}
      />

      <label>סוג העצירה</label>
      <select name="type" value={stop.type || ""} onChange={handleField} required disabled={!writeAccess}>
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
            disabled={!writeAccess}
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
            readOnly={!writeAccess}
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
        readOnly={!writeAccess}
      />
    </div>
  );
}

export default function TripForm({
  pageTitle,
  leaderIdField,
  stopsHint,
  formData,
  stops,
  errors,
  submitError,
  successMessage,
  loading,
  onFieldChange,
  onStopChange,
  onRemoveStop,
  onAddStop,
  onSubmit,
  onCancel,
  submitLabel,
  loadingLabel,
  writeAccess,
  canEditMeta,
  extraSection,
  leaderClassSection,
}) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!canEditMeta) return;
    async function getUsers() {
      const res = await api.get("/api/users");
      setUsers(res.data);
    }
    getUsers();
  }, [canEditMeta]);

  if (!writeAccess) {
    return (
      <>
        <Navbar />
        <main className="page-main">
          <h1 className="page-title">{pageTitle}</h1>
          {extraSection}
          <section className="form-section">
            <h2 className="form-section-title">פרטי הטיול</h2>
            <p><strong>שם הטיול:</strong> {formData.title}</p>
            <p><strong>תאריך:</strong> {formData.tripDate}</p>
          </section>
          <section className="form-section">
            <h2 className="form-section-title">מסלול הטיול — עצירות</h2>
            {stops.length === 0 ? (
              <p>אין עצירות מוגדרות לטיול זה.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {stops.map((stop, i) => (
                  <li key={i} className="stop-card" style={{ marginBottom: "1rem" }}>
                    <p><strong>עצירה {i + 1}:</strong> {stop.name}</p>
                    <p><strong>סוג:</strong> {stop.type}</p>
                    {stop.trailCondition && <p><strong>מצב מסלול:</strong> {stop.trailCondition}</p>}
                    {stop.officialApproval && <p><strong>אישור רשמי:</strong> {stop.officialApproval}</p>}
                    {stop.notes && <p><strong>הערות:</strong> {stop.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">{pageTitle}</h1>

        <form className="trip-form" onSubmit={onSubmit} noValidate>
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
              onChange={onFieldChange}
              readOnly={!canEditMeta}
            />
            {errors.title && <p className="error">{errors.title}</p>}

            <label>תאריך הטיול</label>
            <input
              type="date"
              name="tripDate"
              required
              value={formData.tripDate}
              onChange={onFieldChange}
              readOnly={!canEditMeta}
            />
            {errors.tripDate && <p className="error">{errors.tripDate}</p>}

            {canEditMeta ? (
              <>
                <label>אחראי הטיול</label>
                <select
                  name={leaderIdField}
                  value={formData[leaderIdField]}
                  onChange={onFieldChange}
                  required
                >
                  {formData.tripLeaderName ? (
                    <option value={formData[leaderIdField]}>
                      {formData.tripLeaderName}
                    </option>
                  ) : (
                    <option value="">בחר אחראי טיול</option>
                  )}
                  {users
                    .filter((u) => u.full_name !== formData.tripLeaderName)
                    .map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.full_name}
                      </option>
                    ))}
                </select>
              </>
            ) : (
              <>
                <label>אחראי הטיול</label>
                <input
                  type="text"
                  name={leaderIdField}
                  readOnly
                  value={formData.tripLeaderName || ""}
                  onChange={onFieldChange}
                />
              </>
            )}
            {errors[leaderIdField] && (
              <p className="error">{errors[leaderIdField]}</p>
            )}

            {writeAccess && leaderClassSection}
          </section>

          {/* ── Stops / Route ── */}
          <section className="form-section">
            <h2 className="form-section-title">מסלול הטיול — עצירות</h2>
            <p className="form-section-hint">{stopsHint}</p>

            {stops.map((stop, i) => (
              <StopForm
                key={i}
                stop={stop}
                index={i}
                onChange={onStopChange}
                onRemove={onRemoveStop}
                writeAccess={writeAccess}
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

            {writeAccess && (
              <button type="button" className="add-stop-btn" onClick={onAddStop}>
                + הוסף עצירה
              </button>
            )}
          </section>

          {extraSection}

          {submitError && (
            <p className="error form-submit-error">{submitError}</p>
          )}

          {successMessage && (
            <p className="form-submit-success">{successMessage}</p>
          )}

          {writeAccess && (
            <div className="form-actions-row">
              <button
                type="button"
                className="trip-form-btn trip-form-btn--ghost"
                onClick={onCancel}
              >
                ביטול
              </button>
              <button
                type="submit"
                className="trip-form-btn trip-form-btn--primary"
                disabled={loading}
              >
                {loading ? loadingLabel : submitLabel}
              </button>
            </div>
          )}
        </form>
      </main>
    </>
  );
}