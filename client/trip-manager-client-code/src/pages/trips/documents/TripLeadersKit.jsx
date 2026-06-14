// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Navbar from "../../../components/Navbar.jsx";
// import DocCard from "../../../components/DocCard.jsx";
// import {
//   getTripFiles,
//   openFile,
//   deleteTripFile,
// } from "../../../services/files.service.js";
// import { canManageTrip } from "../../../permissions.js";
// import api from "../../../api.js";
// import "../../trips/TripsPage.css";
// import "../../trips/TripForms.css";
// import "./TripLeadersKit.css";

// // רשימת המסמכים הקבועים שחובה להעלות לכל טיול, לפי קוד מסמך (file_code)
// const REQUIRED_DOCS = [
//   { fileCode: 1, title: "מינוי אחראי טיול" },
//   { fileCode: 2, title: "אישור יציאה לטיול ממנהל מוסד" },
//   { fileCode: 3, title: "אישורי הורים" },
//   { fileCode: 4, title: "רשימת תלמידים" },
//   { fileCode: 5, title: "רשימת תלמידים עם מגבלות רפואיות" },
//   { fileCode: 6, title: "טופס הפניה לטיפול רפואי לתלמיד שנפגע במהלך טיול" },
//   { fileCode: 7, title: "רשימת תלמידים שנפגעו במהלך טיול" },
//   { fileCode: 8, title: "טופס ביטוח למתנדב" },
//   { fileCode: 9, title: "רשימת מלווים וטלפונים חיוניים בטיול" },
//   { fileCode: 10, title: "הנחיות למורה אחראי כיתה" },
//   { fileCode: 11, title: "טופס תיאום טיולים מאושר" },
// ];

// export default function TripLeadersKit() {
//   const { tripId } = useParams();
//   const navigate = useNavigate();

//   const [uploadedFiles, setUploadedFiles] = useState([]); // כל קבצי תיק הטיול שהתקבלו מהשרת
//   const [fetching, setFetching] = useState(true); // האם הרשימה עדיין נטענת
//   const [fetchError, setFetchError] = useState(""); // הודעת שגיאה אם הטעינה נכשלה
//   const [attractions, setAttractions] = useState([]); // אטרקציות במסלול הטיול שדורשות אישור רשמי

//   // extra non-required upload slots added by the user
//   const [additionalSlots, setAdditionalSlots] = useState([]);

//   // טעינת רשימת הקבצים והאטרקציות מחדש בכל פעם שמשנים טיול (tripId)
//   useEffect(() => {
//     fetchFiles();
//     fetchAttractions();
//   }, [tripId]);

//   // שולף מהשרת את כל מסמכי תיק הטיול (כולל מסמכי חובה וקבצים נוספים)
//   async function fetchFiles() {
//     try {
//       setFetching(true);
//       const files = await getTripFiles(tripId);
//       setUploadedFiles(files || []);
//     } catch {
//       setFetchError("לא ניתן לטעון קבצים קיימים");
//     } finally {
//       setFetching(false);
//     }
//   }

//   // שולף את פרטי הטיול ומחלץ ממנו את האטרקציות שבמסלול (לצורך אישורים רשמיים)
//   async function fetchAttractions() {
//     try {
//       const res = await api.get(`/api/trips/${tripId}`);
//       const trip = Array.isArray(res.data) ? res.data[0] : res.data;
//       const parsed =
//         typeof trip?.route_geojson === "string"
//           ? JSON.parse(trip.route_geojson)
//           : trip?.route_geojson;
//       setAttractions((parsed?.stops || []).filter((s) => s.type === "אטרקציה"));
//     } catch (err) {
//       console.error("Error fetching attractions:", err);
//     }
//   }

//   // ממפה כל קוד מסמך (file_code) לקובץ שהועלה עבורו — נבנה מחדש בכל רינדור מתוך uploadedFiles
//   // בנייה מהשרת — שומרת על מצב גם אחרי רענון דף
//   const uploadedByCode = {};
//   uploadedFiles.forEach((f) => {
//     if (f.file_code) uploadedByCode[f.file_code] = f;
//   });

//   // נקרא לאחר העלאה/החלפה/מחיקה מוצלחת של קובץ — מרענן את רשימת הקבצים מהשרת.
//   // משותף בין מסמכי החובה, אישורי האטרקציות, הקבצים הנוספים, ורשימת "כל הקבצים" כדי לא לשכפל את אותה קריאה
//   function refreshFiles() {
//     fetchFiles();
//   }

//   // מוחק קובץ ללא העלאת תחליף, לאחר אישור המשתמש
//   async function handleDeleteFile(fileId) {
//     if (!window.confirm("האם למחוק את הקובץ? לא ניתן לשחזר לאחר המחיקה."))
//       return;
//     try {
//       await deleteTripFile(tripId, fileId);
//       refreshFiles();
//     } catch (err) {
//       alert(err.response?.data?.message || "מחיקת הקובץ נכשלה, נסה שנית");
//     }
//   }

//   // מוסיף סלוט חדש להעלאת "קובץ נוסף" — משתמשים ב-Date.now() כמפתח ייחודי לרשימה
//   function addExtraSlot() {
//     setAdditionalSlots((prev) => [...prev, Date.now()]);
//   }

//   // מסיר סלוט של "קובץ נוסף" מהרשימה לפי המפתח שלו
//   function removeExtraSlot(key) {
//     setAdditionalSlots((prev) => prev.filter((k) => k !== key));
//   }

//   // כמות מסמכי החובה וכמות אישורי האטרקציות שכבר הועלו
//   const requiredDone = REQUIRED_DOCS.filter(
//     (d) => uploadedByCode[d.fileCode],
//   ).length;
//   const attractionsDone = attractions.filter(
//     (_, i) => uploadedByCode[200 + i],
//   ).length;

//   return (
//     <>
//       <Navbar />
//       <main className="page-main">
//         {/* ─── כותרת עמוד ─── */}
//         <div className="kit-page-header">
//           <div>
//             <h1 className="page-title" style={{ marginBottom: 4 }}>
//               תיק הטיול
//             </h1>
//             <p className="form-section-hint">
//               {fetching
//                 ? "טוען נתונים..."
//                 : `${requiredDone}/${REQUIRED_DOCS.length} מסמכי חובה` +
//                   (attractions.length > 0
//                     ? ` · ${attractionsDone}/${attractions.length} אישורי אטרקציות`
//                     : "") +
//                   ` · סה״כ ${uploadedFiles.length} קבצים`}
//             </p>
//           </div>
//           <button
//             className="trip-form-btn trip-form-btn--ghost"
//             onClick={() => navigate(`/trips/${tripId}`)}
//           >
//             חזרה לטיול
//           </button>
//         </div>

//         {fetchError && (
//           <p
//             className="error form-submit-error"
//             style={{ marginBottom: "1.5rem" }}
//           >
//             {fetchError}
//           </p>
//         )}

//         {/* ─── פס התקדמות ─── */}
//         {/* רוחב הפס מחושב כאחוז מסמכי החובה שכבר הועלו מתוך הסך הכל */}
//         <div className="kit-progress-bar-wrap">
//           <div
//             className="kit-progress-bar-fill"
//             style={{ width: `${(requiredDone / REQUIRED_DOCS.length) * 100}%` }}
//           />
//         </div>
//         {attractions.length > 0 && (
//           <div
//             className="kit-progress-bar-wrap"
//             style={{ marginTop: "0.5rem" }}
//           >
//             <div
//               className="kit-progress-bar-fill"
//               style={{
//                 width: `${(attractionsDone / attractions.length) * 100}%`,
//                 background: "#f59e0b",
//               }}
//             />
//           </div>
//         )}

//         {/* ─── מסמכי חובה ─── */}
//         <section className="form-section" style={{ marginTop: "1.5rem" }}>
//           <h2 className="form-section-title">מסמכי חובה — תיק הטיול</h2>
//           <p className="form-section-hint">
//             יש להעלות את כל המסמכים הנדרשים לפי אוגדן הטיולים 2025. מסמך שהועלה
//             מסומן בירוק.
//           </p>
//           <a href="https://www.gov.il/BlobFolder/policy/youth-trips/he/manpower-training_youth_trips-2025.pdf">
//             לאוגדן טיולים מלא לחץ כאן
//           </a>
//           <div className="kit-required-grid">
//             {/* עבור כל מסמך חובה — בודקים אם כבר הועלה קובץ עם אותו file_code */}
//             {REQUIRED_DOCS.map((doc) => (
//               <DocCard
//                 key={doc.fileCode}
//                 badge={doc.fileCode}
//                 title={doc.title}
//                 uploaded={uploadedByCode[doc.fileCode]}
//                 tripId={tripId}
//                 fileCode={doc.fileCode}
//                 onUpload={refreshFiles}
//               />
//             ))}
//           </div>
//         </section>

//         {/* ─── אישורים רשמיים לאטרקציות ─── */}
//         {attractions.length > 0 && (
//           <section className="form-section">
//             <h2 className="form-section-title">אישורים רשמיים לאטרקציות</h2>
//             <p className="form-section-hint">
//               לכל אטרקציה במסלול יש להעלות אישור רשמי מגורם מוסמך.
//             </p>
//             <div className="kit-required-grid">
//               {attractions.map((attraction, i) => (
//                 <DocCard
//                   key={i}
//                   badge="🎯"
//                   title={`אישור רשמי — ${attraction.name}`}
//                   subtitle={
//                     attraction.officialApproval
//                       ? `מספר אישור: ${attraction.officialApproval}`
//                       : null
//                   }
//                   uploaded={uploadedByCode[200 + i]}
//                   tripId={tripId}
//                   fileCode={200 + i}
//                   onUpload={refreshFiles}
//                 />
//               ))}
//             </div>
//           </section>
//         )}

//         {/* ─── קבצים נוספים ─── */}
//         <section className="form-section">
//           <h2 className="form-section-title">קבצים נוספים לתיק הטיול</h2>
//           <p className="form-section-hint">
//             ניתן להוסיף כל מסמך נוסף שאינו ברשימת החובה.
//           </p>

//           {/* כל סלוט פתוח מציג טופס העלאה נפרד עם documentType ייחודי (extra_1, extra_2, ...) */}
//           <div className="kit-required-grid">
//             {additionalSlots.map((key, i) => (
//               <DocCard
//                 key={key}
//                 badge={REQUIRED_DOCS.length + i + 1}
//                 title={`מסמך נוסף ${i + 1}`}
//                 tripId={tripId}
//                 documentType={`extra_${i + 1}`}
//                 onUpload={refreshFiles}
//                 onRemove={() => removeExtraSlot(key)}
//               />
//             ))}
//           </div>

//           <button type="button" className="add-stop-btn" onClick={addExtraSlot}>
//             + הוסף מסמך נוסף לתיק הטיול
//           </button>
//         </section>
//       </main>
//     </>
//   );
// }
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import DocCard from "../../../components/DocCard.jsx";
import {
  getTripFiles,
  openFile,
  deleteTripFile,
} from "../../../services/files.service.js";
import { canManageTrip } from "../../../permissions.js";
import api from "../../../api.js";
import "../TripsPage.css";
import "../TripForms.css";
import "./TripLeadersKit.css";

// רשימת המסמכים הקבועים שחובה להעלות לכל טיול, לפי קוד מסמך (file_code)
const REQUIRED_DOCS = [
  { fileCode: 1, title: "מינוי אחראי טיול" },
  { fileCode: 2, title: "אישור יציאה לטיול ממנהל מוסד" },
  { fileCode: 3, title: "אישורי הורים" },
  { fileCode: 4, title: "רשימת תלמידים" },
  { fileCode: 5, title: "רשימת תלמידים עם מגבלות רפואיות" },
  { fileCode: 6, title: "טופס הפניה לטיפול רפואי לתלמיד שנפגע במהלך טיול" },
  { fileCode: 7, title: "רשימת תלמידים שנפגעו במהלך טיול" },
  { fileCode: 8, title: "טופס ביטוח למתנדב" },
  { fileCode: 9, title: "רשימת מלווים וטלפונים חיוניים בטיול" },
  { fileCode: 10, title: "הנחיות למורה אחראי כיתה" },
  { fileCode: 11, title: "טופס תיאום טיולים מאושר" },
];

export default function TripLeadersKit() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [uploadedFiles, setUploadedFiles] = useState([]); // כל קבצי תיק הטיול שהתקבלו מהשרת
  const [fetching, setFetching] = useState(true); // האם הרשימה עדיין נטענת
  const [fetchError, setFetchError] = useState(""); // הודעת שגיאה אם הטעינה נכשלה
  const [attractions, setAttractions] = useState([]); // אטרקציות במסלול הטיול שדורשות אישור רשמי

  // extra non-required upload slots added by the user
  const [additionalSlots, setAdditionalSlots] = useState([]);

  // טעינת רשימת הקבצים והאטרקציות מחדש בכל פעם שמשנים טיול (tripId)
  useEffect(() => {
    fetchFiles();
    fetchAttractions();
  }, [tripId]);

  // שולף מהשרת את כל מסמכי תיק הטיול (כולל מסמכי חובה וקבצים נוספים)
  async function fetchFiles() {
    try {
      setFetching(true);
      const files = await getTripFiles(tripId);
      setUploadedFiles(files || []);
    } catch {
      setFetchError("לא ניתן לטעון קבצים קיימים");
    } finally {
      setFetching(false);
    }
  }

  // שולף את פרטי הטיול ומחלץ ממנו את האטרקציות שבמסלול (לצורך אישורים רשמיים)
  async function fetchAttractions() {
    try {
      const res = await api.get(`/api/trips/${tripId}`);
      const trip = Array.isArray(res.data) ? res.data[0] : res.data;
      const parsed = typeof trip?.route_geojson === "string"
        ? JSON.parse(trip.route_geojson)
        : trip?.route_geojson;
      setAttractions((parsed?.stops || []).filter((s) => s.type === "אטרקציה"));
    } catch (err) {
      console.error("Error fetching attractions:", err);
    }
  }

  // ממפה כל קוד מסמך (file_code) לקובץ שהועלה עבורו — נבנה מחדש בכל רינדור מתוך uploadedFiles
  // בנייה מהשרת — שומרת על מצב גם אחרי רענון דף
  const uploadedByCode = {};
  uploadedFiles.forEach((f) => {
    if (f.file_code) uploadedByCode[f.file_code] = f;
  });

  // נקרא לאחר העלאה/החלפה/מחיקה מוצלחת של קובץ — מרענן את רשימת הקבצים מהשרת.
  // משותף בין מסמכי החובה, אישורי האטרקציות, הקבצים הנוספים, ורשימת "כל הקבצים" כדי לא לשכפל את אותה קריאה
  function refreshFiles() {
    fetchFiles();
  }

  // מוחק קובץ ללא העלאת תחליף, לאחר אישור המשתמש
  async function handleDeleteFile(fileId) {
    if (!window.confirm("האם למחוק את הקובץ? לא ניתן לשחזר לאחר המחיקה."))
      return;
    try {
      await deleteTripFile(tripId, fileId);
      refreshFiles();
    } catch (err) {
      alert(err.response?.data?.message || "מחיקת הקובץ נכשלה, נסה שנית");
    }
  }

  // מוסיף סלוט חדש להעלאת "קובץ נוסף" — משתמשים ב-Date.now() כמפתח ייחודי לרשימה
  function addExtraSlot() {
    setAdditionalSlots((prev) => [...prev, Date.now()]);
  }

  // מסיר סלוט של "קובץ נוסף" מהרשימה לפי המפתח שלו
  function removeExtraSlot(key) {
    setAdditionalSlots((prev) => prev.filter((k) => k !== key));
  }

  // כמות מסמכי החובה וכמות אישורי האטרקציות שכבר הועלו
  const requiredDone = REQUIRED_DOCS.filter((d) => uploadedByCode[d.fileCode]).length;
  const attractionsDone = attractions.filter((_, i) => uploadedByCode[200 + i]).length;

  return (
    <>
      <Navbar />
      <main className="page-main">
        {/* ─── כותרת עמוד ─── */}
        <div className="kit-page-header">
          <div>
            <h1 className="page-title">
              תיק הטיול
            </h1>
            <p className="form-section-hint">
              {fetching
                ? "טוען נתונים..."
                : `${requiredDone}/${REQUIRED_DOCS.length} מסמכי חובה` +
                  (attractions.length > 0
                    ? ` · ${attractionsDone}/${attractions.length} אישורי אטרקציות`
                    : "") +
                  ` · סה״כ ${uploadedFiles.length} קבצים`}
            </p>
          </div>
          <button
            className="trip-form-btn trip-form-btn--ghost"
            onClick={() => navigate(`/trips/${tripId}`)}
          >
            חזרה לטיול
          </button>
        </div>

        {fetchError && (
          <p className="error form-submit-error kit-fetch-error">
            {fetchError}
          </p>
        )}

        {/* ─── פס התקדמות ─── */}
        {/* רוחב הפס מחושב כאחוז מסמכי החובה שכבר הועלו מתוך הסך הכל */}
        <div className="kit-progress-bar-wrap">
          <div
            className="kit-progress-bar-fill"
            style={{ width: `${(requiredDone / REQUIRED_DOCS.length) * 100}%` }}
          />
        </div>
        {attractions.length > 0 && (
          <div className="kit-progress-bar-wrap kit-progress-bar-wrap--amber">
            <div
              className="kit-progress-bar-fill kit-progress-bar-fill--amber"
              style={{ width: `${(attractionsDone / attractions.length) * 100}%` }}
            />
          </div>
        )}

        {/* ─── מסמכי חובה ─── */}
        <section className="form-section kit-required-section">
          <h2 className="form-section-title">מסמכי חובה — תיק הטיול</h2>
          <p className="form-section-hint">
            יש להעלות את כל המסמכים הנדרשים לפי אוגדן הטיולים 2025. מסמך שהועלה
            מסומן בירוק.
          </p>
          <a href="https://www.gov.il/BlobFolder/policy/youth-trips/he/manpower-training_youth_trips-2025.pdf">
            לאוגדן טיולים מלא לחץ כאן
          </a>
          <div className="kit-required-grid">
            {/* עבור כל מסמך חובה — בודקים אם כבר הועלה קובץ עם אותו file_code */}
            {REQUIRED_DOCS.map((doc) => (
              <DocCard
                key={doc.fileCode}
                badge={doc.fileCode}
                title={doc.title}
                uploaded={uploadedByCode[doc.fileCode]}
                tripId={tripId}
                fileCode={doc.fileCode}
                onUpload={refreshFiles}
              />
            ))}
          </div>
        </section>

        {/* ─── אישורים רשמיים לאטרקציות ─── */}
        {attractions.length > 0 && (
          <section className="form-section">
            <h2 className="form-section-title">אישורים רשמיים לאטרקציות</h2>
            <p className="form-section-hint">
              לכל אטרקציה במסלול יש להעלות אישור רשמי מגורם מוסמך.
            </p>
            <div className="kit-required-grid">
              {attractions.map((attraction, i) => (
                <DocCard
                  key={i}
                  badge="🎯"
                  title={`אישור רשמי — ${attraction.name}`}
                  subtitle={
                    attraction.officialApproval
                      ? `מספר אישור: ${attraction.officialApproval}`
                      : null
                  }
                  uploaded={uploadedByCode[200 + i]}
                  tripId={tripId}
                  fileCode={200 + i}
                  onUpload={refreshFiles}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── קבצים נוספים ─── */}
        <section className="form-section">
          <h2 className="form-section-title">קבצים נוספים לתיק הטיול</h2>
          <p className="form-section-hint">
            ניתן להוסיף כל מסמך נוסף שאינו ברשימת החובה.
          </p>

          {/* כל סלוט פתוח מציג טופס העלאה נפרד עם documentType ייחודי (extra_1, extra_2, ...) */}
          <div className="kit-required-grid">
            {additionalSlots.map((key, i) => (
              <DocCard
                key={key}
                badge={REQUIRED_DOCS.length + i + 1}
                title={`מסמך נוסף ${i + 1}`}
                tripId={tripId}
                documentType={`extra_${i + 1}`}
                onUpload={refreshFiles}
                onRemove={() => removeExtraSlot(key)}
              />
            ))}
          </div>

          <button type="button" className="add-stop-btn" onClick={addExtraSlot}>
            + הוסף מסמך נוסף לתיק הטיול
          </button>
        </section>

      </main>
    </>
  );
}
