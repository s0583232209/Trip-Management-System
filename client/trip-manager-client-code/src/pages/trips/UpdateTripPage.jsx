// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Navbar from "../../components/Navbar.jsx";
// import api from "../../api.js";
// import "./TripsPage.css";
// import "./TripForms.css";

// const STOP_TYPES = [
//   { value: "מסלול הליכה", label: "מסלול הליכה" },
//   { value: "גינה לעצירה", label: "גינה לעצירה" },
//   { value: "אטרקציה", label: "אטרקציה" },
// ];

// const TRAIL_CONDITIONS = [
//   { value: "יבש", label: "יבש" },
//   { value: "רטוב", label: "רטוב" },
// ];

// function StopForm({ stop, index, onChange, onRemove }) {
//   function handleField(e) {
//     const { name, value } = e.target;
//     onChange(index, { ...stop, [name]: value });
//   }

//   return (
//     <div className="stop-card">
//       <div className="stop-card-header">
//         <span className="stop-index">עצירה {index + 1}</span>
//         <button
//           type="button"
//           className="stop-remove-btn"
//           onClick={() => onRemove(index)}
//         >
//           הסר
//         </button>
//       </div>

//       <label>שם העצירה</label>
//       <input
//         type="text"
//         name="name"
//         required
//         placeholder="*"
//         value={stop.name}
//         onChange={handleField}
//       />

//       <label>סוג העצירה</label>
//       <select name="type" value={stop.type} onChange={handleField} required>
//         <option value="">בחר סוג</option>
//         {STOP_TYPES.map((t) => (
//           <option key={t.value} value={t.value}>
//             {t.label}
//           </option>
//         ))}
//       </select>

//       {stop.type === "מסלול הליכה" && (
//         <>
//           <label>מצב המסלול</label>
//           <select
//             name="trailCondition"
//             value={stop.trailCondition || ""}
//             onChange={handleField}
//             required
//           >
//             <option value="">בחר מצב</option>
//             {TRAIL_CONDITIONS.map((c) => (
//               <option key={c.value} value={c.value}>
//                 {c.label}
//               </option>
//             ))}
//           </select>
//         </>
//       )}

//       {stop.type === "אטרקציה" && (
//         <>
//           <label>
//             אישור רשמי <span className="required-badge">חובה</span>
//           </label>
//           <input
//             type="text"
//             name="officialApproval"
//             placeholder="מספר אישור / גורם מאשר *"
//             required
//             value={stop.officialApproval || ""}
//             onChange={handleField}
//           />
//           <p className="field-hint">
//             אטרקציה חייבת לכלול אישור רשמי מגורם מוסמך
//           </p>
//         </>
//       )}

//       <label>הערות (אופציונלי)</label>
//       <input
//         type="text"
//         name="notes"
//         placeholder="הערות נוספות"
//         value={stop.notes || ""}
//         onChange={handleField}
//       />
//     </div>
//   );
// }

// const emptyStop = () => ({
//   name: "",
//   type: "",
//   trailCondition: "",
//   officialApproval: "",
//   notes: "",
// });

// function parseStops(routeGeoJson) {
//   if (!routeGeoJson) return [emptyStop()];
//   try {
//     const parsed = JSON.parse(routeGeoJson);
//     if (Array.isArray(parsed.stops) && parsed.stops.length > 0)
//       return parsed.stops;
//   } catch {
//     /* ignore */
//   }
//   return [emptyStop()];
// }

// export default function UpdateTripPage() {
//   const { tripId } = useParams();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     title: "",
//     tripDate: "",
//     tripLeaderNationalId: "",
//   });
//   const [stops, setStops] = useState([emptyStop()]);
//   const [errors, setErrors] = useState({});
//   const [submitError, setSubmitError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);

//   useEffect(() => {
//     async function fetchTrip() {
//       try {
//         console.log("in fetch trip");
//         const res = await api.get(`/api/trips/${tripId}`);

//         const trip = Array.isArray(res.data) ? res.data[0] : res.data;
//         if (trip) {
//           setFormData({
//             title: trip.title || "",
//             tripDate: trip.trip_date
//               ? new Date(trip.trip_date).toISOString().split("T")[0]
//               : "",
//             tripLeaderNationalId: trip.trip_leader_national_id || "",
//           });
//           setStops(parseStops(trip.route_geojson));
//         }
//       } catch {
//         setSubmitError("לא ניתן לטעון את פרטי הטיול");
//       } finally {
//         setFetching(false);
//       }
//     }
//     fetchTrip();
//   }, [tripId]);

//   function updateField(e) {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }

//   function updateStop(index, updatedStop) {
//     setStops((prev) => prev.map((s, i) => (i === index ? updatedStop : s)));
//   }

//   function removeStop(index) {
//     setStops((prev) => prev.filter((_, i) => i !== index));
//   }

//   function addStop() {
//     setStops((prev) => [...prev, emptyStop()]);
//   }

//   function validate() {
//     const newErrors = {};
//     if (!formData.title.trim()) newErrors.title = "שם הטיול הוא שדה חובה";
//     if (!formData.tripDate) newErrors.tripDate = "תאריך הטיול הוא שדה חובה";
//     if (!formData.tripLeaderNationalId.trim())
//       newErrors.tripLeaderNationalId = "מספר ת.ז. של אחראי הטיול הוא שדה חובה";

//     stops.forEach((stop, i) => {
//       if (!stop.name.trim())
//         newErrors[`stop_${i}_name`] = `שם עצירה ${i + 1} חסר`;
//       if (!stop.type) newErrors[`stop_${i}_type`] = `סוג עצירה ${i + 1} חסר`;
//       if (stop.type === "מסלול הליכה" && !stop.trailCondition)
//         newErrors[`stop_${i}_condition`] = `מצב מסלול עצירה ${i + 1} חסר`;
//       if (stop.type === "אטרקציה" && !stop.officialApproval?.trim())
//         newErrors[`stop_${i}_approval`] = `אישור רשמי עצירה ${i + 1} חסר`;
//     });

//     return newErrors;
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setSubmitError("");
//     const newErrors = validate();
//     setErrors(newErrors);
//     if (Object.keys(newErrors).length > 0) return;

//     setLoading(true);
//     try {
//       const routeGeoJson = JSON.stringify({ stops });
//       await api.put(`/api/trips/${tripId}`, {
//         tripId,
//         title: formData.title,
//         tripDate: formData.tripDate,
//         tripLeaderNationalId: formData.tripLeaderNationalId,
//         routeGeoJson,
//       });
//       navigate(`/trips/${tripId}`);
//     } catch (err) {
//       setSubmitError(
//         err.response?.data?.message ||
//           err.response?.data ||
//           "עדכון הטיול נכשל, נסה שנית",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (fetching) {
//     return (
//       <>
//         <Navbar />
//         <main className="page-main">
//           <p>טוען...</p>
//         </main>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <main className="page-main">
//         <h1 className="page-title">עדכון טיול — {formData.title || tripId}</h1>

//         <form className="trip-form" onSubmit={handleSubmit} noValidate>
//           <section className="form-section">
//             <h2 className="form-section-title">פרטי הטיול</h2>

//             <label>שם הטיול</label>
//             <input
//               type="text"
//               name="title"
//               placeholder="*"
//               required
//               value={formData.title}
//               onChange={updateField}
//             />
//             {errors.title && <p className="error">{errors.title}</p>}

//             <label>תאריך הטיול</label>
//             <input
//               type="date"
//               name="tripDate"
//               required
//               value={formData.tripDate}
//               onChange={updateField}
//             />
//             {errors.tripDate && <p className="error">{errors.tripDate}</p>}

//             <label>מספר ת.ז. של אחראי הטיול</label>
//             <input
//               type="text"
//               name="tripLeaderNationalId"
//               placeholder="9 ספרות *"
//               required
//               value={formData.tripLeaderNationalId}
//               onChange={updateField}
//             />
//             {errors.tripLeaderNationalId && (
//               <p className="error">{errors.tripLeaderNationalId}</p>
//             )}
//           </section>

//           <section className="form-section">
//             <h2 className="form-section-title">מסלול הטיול — עצירות</h2>
//             <p className="form-section-hint">
//               ערוך את העצירות לפי הסדר. לכל עצירה יש לציין שם וסוג. אטרקציות
//               דורשות אישור רשמי; מסלולי הליכה דורשים ציון מצב.
//             </p>

//             {stops.map((stop, i) => (
//               <StopForm
//                 key={i}
//                 stop={stop}
//                 index={i}
//                 onChange={updateStop}
//                 onRemove={removeStop}
//               />
//             ))}

//             {Object.keys(errors)
//               .filter((k) => k.startsWith("stop_"))
//               .map((k) => (
//                 <p key={k} className="error">
//                   {errors[k]}
//                 </p>
//               ))}

//             <button type="button" className="add-stop-btn" onClick={addStop}>
//               + הוסף עצירה
//             </button>
//           </section>

//           {submitError && (
//             <p className="error form-submit-error">{submitError}</p>
//           )}

//           <div className="form-actions-row">
//             <button
//               type="button"
//               className="trip-form-btn trip-form-btn--ghost"
//               onClick={() => navigate(`/trips/${tripId}`)}
//             >
//               ביטול
//             </button>
//             <button
//               type="submit"
//               className="trip-form-btn trip-form-btn--primary"
//               disabled={loading}
//             >
//               {loading ? "שומר..." : "שמור שינויים"}
//             </button>
//           </div>
//         </form>
//       </main>
//     </>
//   );
// }
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
        value={stop.name || ""}
        onChange={handleField}
      />

      <label>סוג העצירה</label>
      <select name="type" value={stop.type || ""} onChange={handleField} required>
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

function parseStops(routeGeoJson) {
  if (!routeGeoJson) return [emptyStop()];
  try {
    // בדיקה האם המידע כבר מגיע כאובייקט או כטקסט JSON שיש לפענח
    const parsed = typeof routeGeoJson === "string" ? JSON.parse(routeGeoJson) : routeGeoJson;
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

  // טעינת הנתונים הישנים של הטיול והשמתם כברירת מחדל בטופס
  useEffect(() => {
    async function fetchTrip() {
      try {
        setFetching(true);
        const res = await api.get(`/api/trips/${tripId}`);
        const trip = Array.isArray(res.data) ? res.data[0] : res.data;
        
        if (trip) {
          setFormData({
            title: trip.title || "",
            tripDate: trip.trip_date
              ? new Date(trip.trip_date).toISOString().split("T")[0]
              : "",
            // תמיכה בשמות שונים של מפתחות שיכולים להגיע מה-DB (camelCase או snake_case)
            tripLeaderNationalId: trip.tripLeaderNationalId || trip.trip_leader_national_id || "",
          });
          
          // חילוץ העצירות הקיימות מהמידע הגיאוגרפי/מסלול הישן
          setStops(parseStops(trip.route_geojson || trip.routeGeoJson));
        } else {
          setSubmitError("לא נמצאו נתונים עבור טיול זה");
        }
      } catch (err) {
        console.error("Error fetching trip details:", err);
        setSubmitError("לא ניתן לטעון את פרטי הטיול הנוכחיים מהשרת");
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
      if (stop.type === "אטרקציה" && (!stop.officialApproval || !stop.officialApproval.trim()))
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
          <p style={{ textAlign: "center", padding: "2rem", fontSize: "1.2rem" }}>
            טוען את פרטי הטיול המקוריים...
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">עדכון טיול — {formData.title || tripId}</h1>

        <form className="trip-form" onSubmit={handleSubmit} noValidate>
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
              name="tripLeaderNationalId"
              placeholder="9 ספרות *"
              required
              value={formData.tripLeaderNationalId}
              onChange={updateField}
            />
            {errors.tripLeaderNationalId && (
              <p className="error">{errors.tripLeaderNationalId}</p>
            )}
          </section>

          <section className="form-section">
            <h2 className="form-section-title">מסלול הטיול — עצירות</h2>
            <p className="form-section-hint">
              ערוך את העצירות לפי הסדר. לכל עצירה יש לציין שם וסוג. אטרקציות
              דורשות אישור רשמי; מסלולי הליכה דורשים ציון מצב.
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
              onClick={() => navigate(`/trips/${tripId}`)}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="trip-form-btn trip-form-btn--primary"
              disabled={loading}
            >
              {loading ? "שומר שינויים..." : "שמור שינויים"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}