import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import TripForm, { emptyStop } from "./TripForm.jsx";
import "./TripsPage.css";
import "./TripForms.css";

function parseStops(routeGeoJson) {
  if (!routeGeoJson) return [emptyStop()];
  try {
    // בדיקה האם המידע כבר מגיע כאובייקט או כטקסט JSON שיש לפענח
    const parsed =
      typeof routeGeoJson === "string"
        ? JSON.parse(routeGeoJson)
        : routeGeoJson;
    if (parsed && Array.isArray(parsed.stops) && parsed.stops.length > 0) {
      return parsed.stops;
    }
  } catch (err) {
    console.error("Error parsing stops from routeGeoJson", err);
  }
  return [emptyStop()];
}

export default function UpdateTripPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    tripDate: "",
    tripLeaderNationalId: "",
  });
  const [stops, setStops] = useState([emptyStop()]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const user = JSON.parse(sessionStorage.getItem("current-user")) || {};
  // console.log(user.role === "principal", "user.role==pricipal");
  // טעינת הנתונים הישנים של הטיול והשמתם כברירת מחדל בטופס
  useEffect(() => {
    async function fetchTrip() {
      try {
        setFetching(true);
        const res = await api.get(`/api/trips/${tripId}`);
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        // console.log(trip);
        if (trip) {
          setFormData({
            title: trip.title || "",
            tripDate: trip.trip_date
              ? new Date(trip.trip_date).toISOString().split("T")[0]
              : "",
            // תמיכה בשמות שונים של מפתחות שיכולים להגיע מה-DB (camelCase או snake_case)
            tripLeaderNationalId: trip.tripLeaderNationalId || "",
            tripLeaderName: trip.tripLeaderFullName || "",
          });

          // חילוץ העצירות הקיימות מהמידע הגיאוגרפי/מסלול הישן
          setStops(parseStops(trip.route_geojson || trip.routeGeoJson));
        } else {
          setSubmitError("לא נמצאו נתונים עבור טיול זה");
          //navigate("/not-found", { replace: true });
        }
      } catch (err) {
        console.error("Error fetching trip details:", err);
        if (err.response?.status === 404) {
          navigate("/not-found", { replace: true });
        } else {
          setSubmitError("לא ניתן לטעון את פרטי הטיול הנוכחיים מהשרת");
        }
      } finally {
        setFetching(false);
      }
    }

    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

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
    if (!formData.tripLeaderNationalId.trim())
      newErrors.tripLeaderNationalId = "מספר ת.ז. של אחראי הטיול הוא שדה חובה";

    stops.forEach((stop, i) => {
      if (!stop.name || !stop.name.trim())
        newErrors[`stop_${i}_name`] = `שם עצירה ${i + 1} חסר`;
      if (!stop.type) newErrors[`stop_${i}_type`] = `סוג עצירה ${i + 1} חסר`;
      if (stop.type === "מסלול הליכה" && !stop.trailCondition)
        newErrors[`stop_${i}_condition`] = `מצב מסלול עצירה ${i + 1} חסר`;
      if (
        stop.type === "אטרקציה" &&
        (!stop.officialApproval || !stop.officialApproval.trim())
      )
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
      await api.put(`/api/trips/${tripId}`, {
        tripId,
        title: formData.title,
        tripDate: formData.tripDate,
        tripLeaderNationalId: formData.tripLeaderNationalId,
        routeGeoJson,
      });
      navigate(`/trips/${tripId}`);
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

  if (fetching) {
    return (
      <>
        <Navbar />
        <main className="page-main">
          <p
            style={{ textAlign: "center", padding: "2rem", fontSize: "1.2rem" }}
          >
            טוען את פרטי הטיול המקוריים...
          </p>
        </main>
      </>
    );
  }

  return (
    <TripForm
      pageTitle={`עדכון טיול — ${formData.title || tripId}`}
      leaderIdField="tripLeaderName"
      stopsHint="ערוך את העצירות לפי הסדר. לכל עצירה יש לציין שם וסוג. אטרקציות דורשות אישור רשמי; מסלולי הליכה דורשים ציון מצב."
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
      onCancel={() => navigate(`/trips/${tripId}`)}
      submitLabel="שמור שינויים"
      loadingLabel="שומר שינויים..."
      writeAccess={user.role == "principal" || user.role == "coordinator"}
    />
  );
}
