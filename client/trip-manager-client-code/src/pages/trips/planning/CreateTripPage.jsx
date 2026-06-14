import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../api.js";
import TripForm, { emptyStop } from "./TripForm.jsx";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user) || {};

  const [formData, setFormData] = useState({ title: "", tripDate: "", tripLeaderId: "", status: 1 });
  const [stops, setStops] = useState([emptyStop()]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/api/classes").then((res) => setSchoolClasses(res.data)).catch(() => {});
  }, []);

  function toggleClass(id) {
    setSelectedClassIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  function updateField(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "שם הטיול הוא שדה חובה";
    if (!formData.tripDate) newErrors.tripDate = "תאריך הטיול הוא שדה חובה";
    if (!formData.tripLeaderId.trim()) newErrors.tripLeaderId = "מספר ת.ז. של אחראי הטיול הוא שדה חובה";
    stops.forEach((stop, i) => {
      if (!stop.name.trim()) newErrors[`stop_${i}_name`] = `שם עצירה ${i + 1} חסר`;
      if (!stop.type) newErrors[`stop_${i}_type`] = `סוג עצירה ${i + 1} חסר`;
      if (stop.type === "מסלול הליכה" && !stop.trailCondition) newErrors[`stop_${i}_condition`] = `מצב מסלול עצירה ${i + 1} חסר`;
      if (stop.type === "אטרקציה" && !stop.officialApproval?.trim()) newErrors[`stop_${i}_approval`] = `אישור רשמי עצירה ${i + 1} חסר`;
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
      const response = await api.post("/api/trips", {
        title: formData.title,
        tripDate: formData.tripDate,
        tripLeaderId: formData.tripLeaderId,
        status: 1,
        routeGeoJson: JSON.stringify({ stops }),
        schoolId: 1,
        tripLeaderClassId: null,
        classIds: selectedClassIds,
      });
      navigate(`/trips/${response.data.insertId || response.data.id || ""}`);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.response?.data || "יצירת הטיול נכשלה, נסה שנית");
    } finally {
      setLoading(false);
    }
  }

  const writeAccess = user.role == "principal" || user.role == "coordinator";

  const classesSection = writeAccess && schoolClasses.length > 0 ? (
    <section className="form-section">
      <h2 className="form-section-title">כיתות משתתפות בטיול</h2>
      <p className="form-section-hint">סמן את הכיתות המשתתפות בטיול זה.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {schoolClasses.map((c) => (
          <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", padding: "0.4rem 0.75rem", border: `1px solid ${selectedClassIds.includes(c.id) ? "#3b82f6" : "#d0d5dd"}`, borderRadius: 6, background: selectedClassIds.includes(c.id) ? "#eff6ff" : "#fff", fontSize: "0.9rem" }}>
            <input type="checkbox" checked={selectedClassIds.includes(c.id)} onChange={() => toggleClass(c.id)} />
            {c.class_name}
          </label>
        ))}
      </div>
    </section>
  ) : null;

  return (
    <TripForm
      pageTitle="יצירת טיול חדש"
      leaderIdField="tripLeaderId"
      stopsHint="הוסף את כל העצירות לפי הסדר. לכל עצירה יש לציין שם וסוג. סוגי האטרקציה דורשים אישור רשמי; מסלולי הליכה דורשים ציון מצב המסלול."
      formData={formData}
      stops={stops}
      errors={errors}
      submitError={submitError}
      loading={loading}
      onFieldChange={updateField}
      onStopChange={(index, s) => setStops((prev) => prev.map((x, i) => i === index ? s : x))}
      onRemoveStop={(index) => setStops((prev) => prev.filter((_, i) => i !== index))}
      onAddStop={() => setStops((prev) => [...prev, emptyStop()])}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/trips")}
      submitLabel="צור טיול"
      loadingLabel="שומר..."
      writeAccess={writeAccess}
      canEditMeta={writeAccess}
      extraSection={classesSection}
    />
  );
}
