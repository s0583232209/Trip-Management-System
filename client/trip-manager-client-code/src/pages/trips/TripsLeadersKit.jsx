// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Navbar from "../../components/Navbar.jsx";
// import api from "../../api.js";
// import "./TripsPage.css";
// import "./TripForms.css";

// export default function TripsLeaderKit() {
//   const { tripId } = useParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // 1. מסמכי חובה רשמיים מתוך אוגדן הטיולים
//   const [officialDocs, setOfficialDocs] = useState({
//     appointmentLetter: { file: null, label: "נספח ב' - כתב מינוי לאחראי/ת טיול בחתימת המנהל/ת" },
//     principalApproval: { file: null, label: "נספח ג' - אישור מנהל/ת ביה\"ס ליציאה לטיול" },
//     securityApproval: { file: null, label: "אישור ביטחוני מהלשכה לתיאום טיולים (חדר מצב)" },
//     exceptionalActivity: { file: null, label: "נספח ד' - אישור מנהל/ת ביה\"ס לפעילות חריגה בטיול (אם יש)" },
//     parentApprovals: { file: null, label: "נספח ה' - ריכוז אישורי הורים על השתתפות בנם/בתם" },
//     studentListThreeCopies: { file: null, label: "רשימת תלמידים משתתפים (עותק לאחראי, אוטובוס ומזכירות)" },
//     medicalRestrictions: { file: null, label: "נספח ו' - רשימת תלמידים עם מגבלות רפואיות" },
//     medicalReferralForm: { file: null, label: "נספח ז' - טופס הפניה לטיפול רפואי לתלמיד שנפגע" },
//     injuredStudentList: { file: null, label: "נספח ח' - רשימת תלמידים שנפגעו במהלך טיול (טופס מעקב)" },
//     volunteerInsurance: { file: null, label: "נספח ט' - טופס ביטוח למתנדב / הורה מלווה" },
//     emergencyContacts: { file: null, label: "נספח י' - רשימת מלווים וטלפונים חיוניים בטיול" },
//     firingInstructions: { file: null, label: "נספח י\"א - הוראות פתיחה באש למאבטחים" },
//     busTeacherInstructions: { file: null, label: "נספח י\"ב - הנחיות למורה אחראי/ת באוטובוס" },
//     classTeacherInstructions: { file: null, label: "נספח י\"ג - הנחיות למורה אחראי/ת כיתה" },
//     weatherUpdate: { file: null, label: "עדכון מזג אויר והתאמתו לטיול (הדפסת תחזית עדכנית)" },
//     phoneCoordination: { file: null, label: "אישור ביצוע תיאום טלפוני כנדרש באישור הטיול" },
//     areaMap: { file: null, label: "המצאות מפת אזור הטיול כולל מפת סימון שבילים בתוקף" },
//     preliminaryTour: { file: null, label: "אישור ביצוע סיור הכנה מקדים ע\"י אחראי הטיול" },
//   });

//   // 2. מסמכים נוספים שהמשתמש יכול להוסיף באופן דינמי
//   const [additionalFiles, setAdditionalFiles] = useState([]);

//   // טעינת מסמכים קיימים במידה והמשתמש נכנס לערוך תיק קיים
//   useEffect(() => {
//     async function fetchFolder() {
//       if (!tripId) return;
//       try {
//         setFetching(true);
//         const res = await api.get(`/api/trips/${tripId}/files`).catch(() => null);
//         if (res && res.data) {
//           // כאן ניתן למפות קבצים קיימים מהשרת (למשל להציג שמות קבצים שכבר הועלו)
//           // בהתאם למבנה ה-API שלך
//         }
//       } catch (err) {
//         console.error("Failed to load Folder", err);
//       } finally {
//         setFetching(false);
//       }
//     }
//     fetchFolder();
//   }, [tripId]);

//   // שינוי קובץ רשמי
//   function handleOfficialFileChange(key, file) {
//     setOfficialDocs((prev) => ({
//       ...prev,
//       [key]: { ...prev[key], file },
//     }));
//   }

//   // ניהול מסמכים דינמיים נוספים
//   function handleAddAdditionalFile() {
//     setAdditionalFiles((prev) => [...prev, { file: null, description: "" }]);
//   }

//   function handleRemoveAdditionalFile(index) {
//     setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
//   }

//   function handleAdditionalFileChange(index, field, value) {
//     setAdditionalFiles((prev) =>
//       prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
//     );
//   }

//   // שליחת תיק הטיול לשרת
//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("tripId", tripId);

//       // 1. הוספת קבצי החובה הרשמיים
//       Object.keys(officialDocs).forEach((key) => {
//         if (officialDocs[key].file) {
//           formData.append(`official_${key}`, officialDocs[key].file);
//         }
//       });

//       // 2. הוספת קבצים אקסטרה דינמיים
//       let extraCount = 0;
//       additionalFiles.forEach((item) => {
//         if (item.file) {
//           formData.append("additionalFiles", item.file);
//           formData.append(`additionalDescription_${extraCount}`, item.description);
//           extraCount++;
//         }
//       });
// console.log(formData)
//       await api.post(`/api/trips/${tripId}/files`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setSuccess("אוגדן ותיק הטיול עודכנו ונשמרו בהצלחה במערכת!");
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "שמירת תיק אוגדן הטיול נכשלה.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (fetching) {
//     return (
//       <>
//         <Navbar />
//         <main className="page-main" style={{ textAlign: "center", padding: "3rem" }}>
//           <h2>טוען את מסמכי אוגדן הטיול...</h2>
//         </main>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <main className="page-main" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
//         <h1 className="page-title">בניית אוגדן ותיק טיול — טיול {tripId}</h1>

//         <form className="trip-form" onSubmit={handleSubmit} noValidate>

//           {/* חלק א': אישורים ביטחוניים וניהוליים */}
//           <section className="form-section">
//             <h2 className="form-section-title">חלק א': אישורים ביטחוניים וניהוליים</h2>
//             <p className="form-section-hint">יש להעלות את מסמכי החתימות הרשמיים ואישורי המנהל.</p>

//             <div className="stop-card" style={{ padding: "1.25rem" }}>
//               <label>{officialDocs.appointmentLetter.label} *</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("appointmentLetter", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.principalApproval.label} *</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("principalApproval", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.securityApproval.label} *</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("securityApproval", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.exceptionalActivity.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("exceptionalActivity", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.preliminaryTour.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("preliminaryTour", e.target.files[0])} disabled={loading} />
//             </div>
//           </section>

//           {/* חלק ב': מסמכי כיתה, תלמידים ורפואה */}
//           <section className="form-section">
//             <h2 className="form-section-title">חלק ב': רשימות תלמידים ומסמכים רפואיים</h2>
//             <p className="form-section-hint font-weight-bold">אישורי הורים, רשימות עותקים ונספחי בטיחות רפואיים.</p>

//             <div className="stop-card" style={{ padding: "1.25rem" }}>
//               <label>{officialDocs.parentApprovals.label} *</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("parentApprovals", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.studentListThreeCopies.label} *</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("studentListThreeCopies", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.medicalRestrictions.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("medicalRestrictions", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.medicalReferralForm.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("medicalReferralForm", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.injuredStudentList.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("injuredStudentList", e.target.files[0])} disabled={loading} />
//             </div>
//           </section>

//           {/* חלק ג': לוגיסטיקה, שטח והנחיות צוות */}
//           <section className="form-section">
//             <h2 className="form-section-title">חלק ג': לוגיסטיקה, נהלים ושטח</h2>
//             <p className="form-section-hint">הנחיות לצוותי הביטחון, מפות, תיאומים ומזג אוויר.</p>

//             <div className="stop-card" style={{ padding: "1.25rem" }}>
//               <label>{officialDocs.volunteerInsurance.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("volunteerInsurance", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.emergencyContacts.label} *</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("emergencyContacts", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.firingInstructions.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("firingInstructions", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.busTeacherInstructions.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("busTeacherInstructions", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.classTeacherInstructions.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("classTeacherInstructions", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.weatherUpdate.label} *</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("weatherUpdate", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.phoneCoordination.label}</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("phoneCoordination", e.target.files[0])} disabled={loading} />

//               <label style={{ marginTop: "1rem" }}>{officialDocs.areaMap.label} *</label>
//               <input type="file" onChange={(e) => handleOfficialFileChange("areaMap", e.target.files[0])} disabled={loading} />
//             </div>
//           </section>

//           {/* חלק ד': קבצים ומסמכים נוספים בהתאמה אישית */}
//           <section className="form-section">
//             <h2 className="form-section-title">מסמכים וקבצים נוספים לתיק הטיול</h2>
//             <p className="form-section-hint">צריך להעלות קבצים נוספים? לחץ על הכפתור מטה והוסף כמה שצריך.</p>

//             {additionalFiles.map((item, index) => (
//               <div key={index} className="stop-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
//                 <div className="stop-card-header" style={{ marginBottom: "0.75rem" }}>
//                   <span className="stop-index">מסמך נוסף {index + 1}</span>
//                   <button type="button" className="stop-remove-btn" onClick={() => handleRemoveAdditionalFile(index)}>
//                     הסר
//                   </button>
//                 </div>

//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "end" }}>
//                   <div>
//                     <label>בחר קובץ</label>
//                     <input
//                       type="file"
//                       onChange={(e) => handleAdditionalFileChange(index, "file", e.target.files[0])}
//                       required
//                       disabled={loading}
//                     />
//                   </div>
//                   <div>
//                     <label>תיאור / כותרת הקובץ</label>
//                     <input
//                       type="text"
//                       placeholder="לדוגמה: תעודת מגיש עזרה ראשונה מעודכנת"
//                       value={item.description}
//                       onChange={(e) => handleAdditionalFileChange(index, "description", e.target.value)}
//                       disabled={loading}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}

//             <button type="button" className="add-stop-btn" onClick={handleAddAdditionalFile} disabled={loading}>
//               + הוסף מסמך נוסף לתיק הטיול
//             </button>
//           </section>

//           {/* הודעות שגיאה והצלחה */}
//           {error && <p className="error form-submit-error">{error}</p>}
//           {success && <p style={{ color: "green", fontWeight: "bold", textAlign: "right", marginTop: "1rem" }}>{success}</p>}

//           {/* כפתורי שמירה וביטול */}
//           <div className="form-actions-row">
//             <button
//               type="button"
//               className="trip-form-btn trip-form-btn--ghost"
//               onClick={() => navigate(`/trips/${tripId}`)}
//               disabled={loading}
//             >
//               ביטול
//             </button>
//             <button
//               type="submit"
//               className="trip-form-btn trip-form-btn--primary"
//               disabled={loading}
//             >
//               {loading ? "שומר תיק טיול..." : "שמור אוגדן טיול"}
//             </button>
//           </div>

//         </form>
//       </main>
//     </>
//   );
// }
// TripLeadersKit.jsx

import "./TripsLeadersKit.css";
import UploadTripFile from "./UploadTripFile.jsx";
import Navbar from "../../components/Navbar.jsx";

const requiredFiles = [
  {
    key: "principalApproval",
    title: "אישור מנהל ורכז טיולים",
    description: "האישור הרשמי לביצוע הטיול",
  },
  {
    key: "parentsApproval",
    title: "אישורי הורים",
    description: "אישורים חתומים מכלל ההורים",
  },
  {
    key: "medicalForms",
    title: "טפסים רפואיים",
    description: "רשימת תלמידים עם מידע רפואי",
  },
  {
    key: "securityApproval",
    title: "אישור ביטחוני",
    description: "אישור הגורמים המוסמכים",
  },
  {
    key: "studentsList",
    title: "רשימת משתתפים",
    description: "רשימת כלל התלמידים והמלווים",
  },
  {
    key: "schedule",
    title: "תוכנית הטיול",
    description: "לו״ז ומסלול הטיול",
  },
];

export default function TripLeadersKit({
  tripId,
  uploadedFiles = [],
  onUploadSuccess,
  onOpenFile,
}) {
  return (
    <>
      <Navbar></Navbar>
      <div className="trip-kit-grid">
        {requiredFiles.map((requiredFile) => {
          const existingFile = uploadedFiles.find(
            (file) => file.documentType === requiredFile.key,
          );

          return (
            <div
              key={requiredFile.key}
              className={`trip-kit-card ${
                existingFile ? "trip-kit-card--done" : ""
              }`}
            >
              <div className="trip-kit-header">
                <span className="trip-kit-status">
                  {existingFile ? "✓" : "○"}
                </span>

                <div>
                  <h3>{requiredFile.title}</h3>
                  <p>{requiredFile.description}</p>
                </div>
              </div>

              {existingFile && (
                <div className="trip-kit-current-file">
                  <span>{existingFile.original_name}</span>

                  <button
                    type="button"
                    className="trip-kit-open-btn"
                    onClick={() => onOpenFile(existingFile.id)}
                  >
                    פתח קובץ
                  </button>
                </div>
              )}

              <UploadTripFile
                compact
                tripId={tripId}
                documentType={requiredFile.key}
                existingFile={existingFile}
                onUploadSuccess={onUploadSuccess}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
