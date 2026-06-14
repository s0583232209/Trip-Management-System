import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api.js";
import "../TripsPage.css";
import "../TripForms.css";

export default function AddTripTeachers({ onSuccess } = {}) {
  const { tripId: paramTripId } = useParams();
  const navigate = useNavigate();
  const tripId = paramTripId;
  const [assignments, setAssignments] = useState([{ teacherId: "", classId: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tripStaff, setTripStaff] = useState([]);
  const [schoolTeachers, setSchoolTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [staffRes, usersRes, classesRes] = await Promise.all([
        api.get(`/api/trips/${tripId}/staff`),
        api.get(`/api/users`),
        api.get(`/api/classes`),
      ]);
      setTripStaff(staffRes.data.employees ?? staffRes.data ?? []);
      setSchoolTeachers(usersRes.data ?? []);
      setClasses(classesRes.data ?? []);
    }
    fetchData();
  }, [tripId]);

  const assignedIds = new Set(tripStaff.map((s) => s.user_id ?? s.id));

  function availableTeachers(currentValue) {
    const otherSelected = new Set(
      assignments
        .map((a) => a.teacherId)
        .filter((id) => id !== currentValue && id !== ""),
    );
    return schoolTeachers.filter(
      (t) => !assignedIds.has(t.user_id ?? t.id) && !otherSelected.has(String(t.user_id ?? t.id))
    );
  }

  function updateTeacher(index, value) {
    setAssignments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, teacherId: value } : a)),
    );
  }

  function updateClass(index, value) {
    setAssignments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, classId: value } : a)),
    );
  }

  function addField() {
    setAssignments((prev) => [...prev, { teacherId: "", classId: "" }]);
  }

  function removeField(index) {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const filled = assignments.filter((a) => a.teacherId !== "");
    if (filled.length === 0) {
      setError("יש לבחור לפחות מורה אחד");
      return;
    }
    setLoading(true);
    try {
      const staffAssignments = filled.map((a) => ({
        staffId: Number(a.teacherId),
        classId: a.classId ? Number(a.classId) : null,
      }));
      await api.post(`/api/trips/${tripId}/staff`, { staffAssignments });
      setSuccess("המורים שויכו לטיול בהצלחה!");
      setAssignments([{ teacherId: "", classId: "" }]);
      const staffRes = await api.get(`/api/trips/${tripId}/staff`);
      setTripStaff(staffRes.data.employees ?? staffRes.data ?? []);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "הוספת המורים נכשלה, נסה שנית");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-main">
      <h1 className="page-title">שיבוץ מורים מלווים לטיול</h1>
      <form className="trip-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <h2 className="form-section-title">הוספת מורים מלווים</h2>
          <p className="form-section-hint">
            בחר מורים מהרשימה להוספה לטיול ושייך כל מורה לכיתה שילווה. מורים שכבר משובצים לטיול אינם מופיעים ברשימה.
          </p>

          {assignments.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
              <select value={a.teacherId} onChange={(e) => updateTeacher(i, e.target.value)}>
                <option value="">-- בחר מורה --</option>
                {availableTeachers(a.teacherId).map((t) => (
                  <option key={t.user_id ?? t.id} value={String(t.user_id ?? t.id)}>
                    {t.full_name}
                  </option>
                ))}
              </select>
              <select value={a.classId} onChange={(e) => updateClass(i, e.target.value)}>
                <option value="">-- בחר כיתה --</option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.class_name}
                  </option>
                ))}
              </select>
              {assignments.length > 1 && (
                <button type="button" className="stop-remove-btn" onClick={() => removeField(i)}>
                  הסר
                </button>
              )}
            </div>
          ))}

          <button type="button" className="add-stop-btn" onClick={addField} disabled={loading}>
            + הוסף מורה
          </button>
        </section>

        {error && <p className="error form-submit-error">{error}</p>}
        {success && <p style={{ color: "green", fontWeight: "bold", textAlign: "right", marginTop: "1rem" }}>{success}</p>}

        <div className="form-actions-row">
          <button type="button" className="trip-form-btn trip-form-btn--ghost" onClick={() => navigate(`/trips/${tripId}/planning`)} disabled={loading}>
            ביטול
          </button>
          <button type="submit" className="trip-form-btn trip-form-btn--primary" disabled={loading}>
            {loading ? "שומר..." : "שמור"}
          </button>
        </div>
      </form>

      <div style={{ marginTop: "2rem" }}>
        <h4>מורים משובצים לטיול</h4>
        {tripStaff.length === 0 ? (
          <p>אין מורים משובצים עדיין</p>
        ) : (
          <ul>
            {tripStaff.map((t) => (
              <li key={t.user_id ?? t.id}>{t.full_name}</li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
