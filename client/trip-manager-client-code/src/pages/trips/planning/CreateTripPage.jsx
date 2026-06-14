import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../api.js";
import TripForm, { emptyStop } from "./TripForm.jsx";

const GRADE_LABELS = [
  "א'",
  "ב'",
  "ג'",
  "ד'",
  "ה'",
  "ו'",
  "ז'",
  "ח'",
  "ט'",
  "י'",
  "י\"א",
  "י\"ב",
];

const emptyGrades = () =>
  GRADE_LABELS.map((label, i) => ({
    grade: i + 1,
    label,
    selected: false,
    classCount: 1,
    classNames: [`${label}-1`],
  }));

export default function CreateTripPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user) || {};

  const [formData, setFormData] = useState({
    title: "",
    tripDate: "",
    tripLeaderId: "",
    status: 1,
  });

  const [stops, setStops] = useState([emptyStop()]);
  const [grades, setGrades] = useState(emptyGrades());
  const [tripLeaderClassKey, setTripLeaderClassKey] = useState("");
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

  function toggleGrade(index) {
    setGrades((prev) =>
      prev.map((g, i) => (i === index ? { ...g, selected: !g.selected } : g)),
    );
  }

  function updateClassCount(index, value) {
    const count = Math.max(1, Number(value) || 1);
    setGrades((prev) =>
      prev.map((g, i) => {
        if (i !== index) return g;
        const classNames = Array.from(
          { length: count },
          (_, j) => g.classNames[j] || `${g.label}-${j + 1}`,
        );
        return { ...g, classCount: count, classNames };
      }),
    );
  }

  function updateClassName(gradeIndex, classIndex, value) {
    setGrades((prev) =>
      prev.map((g, i) => {
        if (i !== gradeIndex) return g;
        const classNames = g.classNames.map((n, j) =>
          j === classIndex ? value : n,
        );
        return { ...g, classNames };
      }),
    );
  }

  // רשימת הכיתות החדשות שהוגדרו לטיול (לבחירת כיתת אחראי הטיול)
  const availableClassOptions = grades
    .filter((g) => g.selected)
    .flatMap((g) =>
      g.classNames.map((className, j) => ({
        key: `${g.grade}-${j}`,
        grade: g.grade,
        className,
      })),
    );

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

    grades
      .filter((g) => g.selected)
      .forEach((g) => {
        g.classNames.forEach((name, j) => {
          if (!name.trim())
            newErrors[`grade_${g.grade}_class_${j}`] =
              `יש להזין שם לכיתה ${j + 1} בשכבה ${g.label}`;
        });
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

      // יצירת הכיתות שהוגדרו עבור השכבות שנבחרו (לפני יצירת הטיול,
      // כדי שיהיה אפשר לשייך את אחראי הטיול לכיתה ולקשר את הכיתות לטיול)
      const createdClasses = await Promise.all(
        availableClassOptions.map(async (opt) => {
          const res = await api.post("/api/classes", {
            className: opt.className,
            grade: opt.grade,
          });
          return { ...opt, id: res.data.id };
        }),
      );

      const leaderClass = createdClasses.find(
        (c) => c.key === tripLeaderClassKey,
      );

      const payload = {
        title: formData.title,
        tripDate: formData.tripDate,
        tripLeaderId: formData.tripLeaderId,
        status: 1,
        routeGeoJson,
        schoolId: 1,
        tripLeaderClassId: leaderClass ? leaderClass.id : null,
        classIds: createdClasses.map((c) => c.id),
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

  const leaderClassSection = (
    <>
      <label>כיתת אחראי הטיול (אופציונלי)</label>
      <select
        value={tripLeaderClassKey}
        onChange={(e) => setTripLeaderClassKey(e.target.value)}
      >
        <option value="">ללא שיוך לכיתה</option>
        {availableClassOptions.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.className}
          </option>
        ))}
      </select>
    </>
  );

  const gradesSection = (
    <section className="form-section">
      <h2 className="form-section-title">שכבות וכיתות המשתתפות בטיול</h2>
      <p className="form-section-hint">
        בחר את השכבות המשתתפות בטיול, וקבע עבור כל שכבה את מספר הכיתות ואת שם
        כל כיתה.
      </p>

      {grades.map((g, i) => (
        <div key={g.grade} className="stop-card">
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              checked={g.selected}
              onChange={() => toggleGrade(i)}
            />
            שכבה {g.label}
          </label>

          {g.selected && (
            <>
              <label>מספר כיתות בשכבה</label>
              <input
                type="number"
                min="1"
                value={g.classCount}
                onChange={(e) => updateClassCount(i, e.target.value)}
              />

              {g.classNames.map((name, j) => (
                <div key={j}>
                  <label>שם כיתה {j + 1}</label>
                  <input
                    type="text"
                    value={name}
                    placeholder={`${g.label}-${j + 1}`}
                    onChange={(e) => updateClassName(i, j, e.target.value)}
                  />
                  {errors[`grade_${g.grade}_class_${j}`] && (
                    <p className="error">
                      {errors[`grade_${g.grade}_class_${j}`]}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      ))}
    </section>
  );

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
      canEditMeta={user.role == "principal" || user.role == "coordinator"}
      extraSection={gradesSection}
      leaderClassSection={leaderClassSection}
    />
  );
}
