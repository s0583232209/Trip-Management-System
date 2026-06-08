import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api.js";
import TripForm, { emptyStop } from "./TripForm.jsx";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("current-user")) || {};

  const [formData, setFormData] = useState({
    title: "",
    tripDate: "",
    tripLeaderId: "",
    status: 1,
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
        status: 1,
        routeGeoJson,
        schoolId: 1,
      };
      console.log(payload);
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
      onStopChange={updateStop}
      onRemoveStop={removeStop}
      onAddStop={addStop}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/trips")}
      submitLabel="צור טיול"
      loadingLabel="שומר..."
      writeAccess={user.role == "principal" || user.role == "coordinator"}
    />
  );
}
