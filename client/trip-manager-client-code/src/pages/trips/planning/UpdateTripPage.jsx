import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar.jsx";
import api from "../../../api.js";
import TripForm, { emptyStop } from "./TripForm.jsx";
import { canUpdateRoute, canSetPostEdit, canManageTrip, canViewTripDetails, TRIP_STATUS, TRIP_STATUS_LABEL } from "../../../permissions.js";
import { toDateOnlyString } from "../../../dateUtils.js";
import "../TripsPage.css";
import "../TripForms.css";

function parseStops(routeGeoJson) {
  if (!routeGeoJson) return [];
  try {
    const parsed =
      typeof routeGeoJson === "string"
        ? JSON.parse(routeGeoJson)
        : routeGeoJson;
    if (Array.isArray(parsed.stops) && parsed.stops.length > 0)
      return parsed.stops;
  } catch (err) {
    console.error("Error parsing stops:", err);
  }
  return [];
}

export default function UpdateTripPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    tripDate: "",
    tripLeaderNationalId: "",
  });
  const [tripStatus, setTripStatus] = useState(null);
  const [postEditNote, setPostEditNote] = useState("");
  const [postEditLoading, setPostEditLoading] = useState(false);
  const [postEditError, setPostEditError] = useState("");
  const [stops, setStops] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tripClasses, setTripClasses] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [classesSuccess, setClassesSuccess] = useState("");
  const [classesError, setClassesError] = useState("");

  const user = useSelector((state) => state.auth.user) || {};
  // טעינת הנתונים הישנים של הטיול והשמתם כברירת מחדל בטופס
  useEffect(() => {
    if (!tripId) return;
    async function fetchTrip() {
      try {
        const res = await api.get(`/api/trips/${tripId}`);
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!trip) {
          navigate("/not-found", { replace: true });
          return;
        }
        if (!canViewTripDetails()) {
          navigate("/unauthorized", { replace: true });
          return;
        }
        setTripStatus(trip.trip_status ?? null);
        setFormData({
          title: trip.title || "",
          tripDate: toDateOnlyString(trip.trip_date),
          // ה-select של אחראי הטיול מציג options עם value=u.user_id (DB id),
          // לכן הברירת מחדל חייבת להיות trip_leader_id ולא national_id, אחרת לא יימצא match
          tripLeaderNationalId: trip.trip_leader_id ?? "",
          tripLeaderName: trip.tripLeaderFullName || "",
        });

        // חילוץ העצירות הקיימות מהמידע הגיאוגרפי/מסלול הישן
        setStops(parseStops(trip.route_geojson || trip.routeGeoJson));

        const [classesRes, schoolClassesRes] = await Promise.all([
          api.get(`/api/trips/${tripId}/classes`),
          api.get(`/api/trips/${tripId}/school-classes`),
        ]);
        setTripClasses(classesRes.data.map((c) => c.id));
        setSchoolClasses(schoolClassesRes.data);
      } catch (err) {
        if (err.response?.status === 404)
          navigate("/not-found", { replace: true });
        else setSubmitError("לא ניתן לטעון את פרטי הטיול");
      } finally {
        setFetching(false);
      }
    }
    fetchTrip();
  }, [tripId]);

  function validate() {
    const e = {};
    if (!formData.title.trim()) e.title = "שם הטיול הוא שדה חובה";
    if (!formData.tripDate) e.tripDate = "תאריך הטיול הוא שדה חובה";
    if (!String(formData.tripLeaderNationalId || "").trim())
      e.tripLeaderNationalId = "אחראי הטיול הוא שדה חובה";
    stops.forEach((stop, i) => {
      if (!stop.name?.trim()) e[`stop_${i}_name`] = `שם עצירה ${i + 1} חסר`;
      if (!stop.type) e[`stop_${i}_type`] = `סוג עצירה ${i + 1} חסר`;
      if (stop.type === "מסלול הליכה" && !stop.trailCondition)
        e[`stop_${i}_condition`] = `מצב מסלול עצירה ${i + 1} חסר`;
      if (stop.type === "אטרקציה" && !stop.officialApproval?.trim())
        e[`stop_${i}_approval`] = `אישור רשמי עצירה ${i + 1} חסר`;
    });
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setSuccessMessage("");
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      await api.put(`/api/trips/${tripId}`, {
        tripId,
        title: formData.title,
        tripDate: formData.tripDate,
        tripLeaderNationalId: formData.tripLeaderNationalId,
        routeGeoJson: JSON.stringify({ stops }),
      });
      setSuccessMessage("פרטי הטיול עודכנו בהצלחה ✓");
      setTimeout(() => navigate(`/trips/${tripId}`), 3000);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.response?.data ||
          "עדכון הטיול נכשל, נסה שנית",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveClasses() {
    setClassesError("");
    setClassesSuccess("");
    try {
      await api.put(`/api/trips/${tripId}/classes`, { classIds: tripClasses });
      setClassesSuccess("כיתות עודכנו בהצלחה ✓");
      setTimeout(() => setClassesSuccess(""), 3000);
    } catch (err) {
      setClassesError(err.response?.data?.message || "עדכון כיתות נכשל");
    }
  }

  function toggleClass(id) {
    setTripClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const writeAccess = canUpdateRoute(tripStatus, formData.tripDate, formData.tripLeaderNationalId);
  // עריכת שם/תאריך/אחראי — מנהל ורכז בלבד; עריכת עצירות — גם אחראי הטיול ביום הטיול
  const canEditMeta = canManageTrip();

  async function handleSetPostEdit(e) {
    e.preventDefault();
    if (!postEditNote.trim()) { setPostEditError("יש להזין הערת הסבר"); return; }
    setPostEditLoading(true); setPostEditError("");
    try {
      await api.put(`/api/trips/${tripId}/post-edit`, { note: postEditNote });
      setTripStatus(TRIP_STATUS.POST_EDIT);
      setPostEditNote("");
    } catch (err) {
      setPostEditError(err.response?.data?.message || "הפעולה נכשלה");
    } finally {
      setPostEditLoading(false);
    }
  }

  const statusLabel = TRIP_STATUS_LABEL[tripStatus] || "";
  const isLocked = tripStatus === TRIP_STATUS.APPROVED || tripStatus === TRIP_STATUS.DONE;

  const statusBanner =
    tripStatus === TRIP_STATUS.DONE && canManageTrip() ? (
      <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.75rem 1.5rem", marginBottom: "1rem" }}>
        הטיול הסתיים — הטופס נעול לעריכה.
      </div>
    ) : tripStatus === TRIP_STATUS.APPROVED && canSetPostEdit() ? (
      <div style={{ background: "#fffbe6", border: "1px solid #f59e0b", borderRadius: 8, padding: "1rem 1.5rem", marginBottom: "1rem" }}>
        <strong>הטיול מאושר — עריכה נעולה.</strong>
        <p style={{ margin: "0.5rem 0" }}>לפתיחת עריכה בדיעבד יש להזין הערת הסבר:</p>
        <form onSubmit={handleSetPostEdit} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            value={postEditNote}
            onChange={e => setPostEditNote(e.target.value)}
            placeholder="למשל: הטיול נדחה לבקשת המנהל ביום X"
            style={{ flex: 1, minWidth: 200, padding: "0.4rem 0.75rem", borderRadius: 6, border: "1px solid #ccc" }}
          />
          <button type="submit" className="trip-form-btn trip-form-btn--primary" disabled={postEditLoading}>
            {postEditLoading ? "שומר..." : "פתח לעריכה"}
          </button>
        </form>
        {postEditError && <p className="error" style={{ marginTop: "0.5rem" }}>{postEditError}</p>}
      </div>
    ) : null;

  const classesSection = writeAccess && schoolClasses.length > 0 ? (
    <div className="form-section" style={{ marginTop: "1.5rem" }}>
      <h2 className="form-section-title">כיתות משתתפות בטיול</h2>
      <p className="form-section-hint">סמן את הכיתות המשתתפות בטיול זה.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {schoolClasses.map((c) => (
          <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", padding: "0.4rem 0.75rem", border: `1px solid ${tripClasses.includes(c.id) ? "#3b82f6" : "#d0d5dd"}`, borderRadius: 6, background: tripClasses.includes(c.id) ? "#eff6ff" : "#fff", fontSize: "0.9rem" }}>
            <input type="checkbox" checked={tripClasses.includes(c.id)} onChange={() => toggleClass(c.id)} />
            {c.class_name}
          </label>
        ))}
      </div>
      {classesError && <p className="error">{classesError}</p>}
      {classesSuccess && <p style={{ color: "#16a34a", fontSize: "0.88rem" }}>{classesSuccess}</p>}
      <button type="button" className="trip-form-btn trip-form-btn--primary" onClick={handleSaveClasses}>
        שמור כיתות
      </button>
    </div>
  ) : null;

  return (
    <TripForm
      pageTitle={
        writeAccess
          ? `עדכון מסלול — ${formData.title}`
          : `מסלול הטיול — ${formData.title}`
      }
      leaderIdField="tripLeaderNationalId"
      stopsHint="לכל עצירה יש לציין שם וסוג. אטרקציות דורשות אישור רשמי; מסלולי הליכה דורשים ציון מצב."
      formData={formData}
      stops={stops}
      errors={errors}
      submitError={submitError}
      successMessage={successMessage}
      loading={loading}
      onFieldChange={(e) =>
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
      }
      onStopChange={(i, s) =>
        setStops((p) => p.map((x, j) => (j === i ? s : x)))
      }
      onRemoveStop={(i) => setStops((p) => p.filter((_, j) => j !== i))}
      onAddStop={() => setStops((p) => [...p, emptyStop()])}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/trips/${tripId}`)}
      submitLabel="שמור שינויים"
      loadingLabel="שומר..."
      writeAccess={writeAccess}
      canEditMeta={canEditMeta}
      extraSection={<>{statusBanner}{classesSection}</>}
    />
  );
}