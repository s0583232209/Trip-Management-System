import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar.jsx";
import { canManageTrip } from "../../../permissions.js";
import api from "../../../api.js";
import "../TripsPage.css";
import "../TripForms.css";
import "./TripLeadersKit.css";

const EXAMPLE_TRIP_ID = "example-kit";

const REQUIRED_DOCS = [
  {
    fileCode: 1,
    title: "מינוי אחראי טיול",
    hint: "מסמך רשמי המאשר את זיהוי אחראי הטיול מטעם בית הספר, חתום על ידי מנהל/ת המוסד.",
  },
  {
    fileCode: 2,
    title: "אישור יציאה לטיול ממנהל מוסד",
    hint: "אישור בכתב מאת מנהל/ת בית הספר המתיר את קיום הטיול במועד ובמסלול שנקבעו.",
  },
  {
    fileCode: 3,
    title: "אישורי הורים",
    hint: "טפסי הסכמת הורים חתומים עבור כל תלמיד/ה המשתתפים בטיול.",
  },
  {
    fileCode: 4,
    title: "רשימת תלמידים",
    hint: "רשימה מסודרת של כל התלמידים המשתתפים בטיול, כולל מספרי תעודת זהות.",
  },
  {
    fileCode: 5,
    title: "רשימת תלמידים עם מגבלות רפואיות",
    hint: "פירוט תלמידים עם רגישויות או מגבלות רפואיות, כולל הנחיות טיפול והתמודדות.",
  },
  {
    fileCode: 6,
    title: "טופס הפניה לטיפול רפואי לתלמיד שנפגע במהלך טיול",
    hint: "טופס מוכן מראש להפניית תלמיד לטיפול רפואי במקרה הצורך במהלך הטיול.",
  },
  {
    fileCode: 7,
    title: "רשימת תלמידים שנפגעו במהלך טיול",
    hint: "טופס מעקב לתיעוד תלמידים שנפגעו, אם וכאשר יקרה אירוע במהלך הטיול.",
  },
  {
    fileCode: 8,
    title: "טופס ביטוח למתנדב",
    hint: "אישור ביטוח עבור מלווים מתנדבים שאינם עובדי המוסד.",
  },
  {
    fileCode: 9,
    title: "רשימת מלווים וטלפונים חיוניים בטיול",
    hint: "פירוט כל אנשי הצוות המלווים ומספרי הטלפון החיוניים (מוקד חירום, הורים, גורמי הצלה).",
  },
  {
    fileCode: 10,
    title: "הנחיות למורה אחראי כיתה",
    hint: "מסמך הנחיות מפורט למורה המלווה את הכיתה בנוגע להתנהלות ביום הטיול.",
  },
  {
    fileCode: 11,
    title: "טופס תיאום טיולים מאושר",
    hint: "אישור תיאום הטיול שהוגש ואושר במשרד החינוך / הרשות המקומית.",
  },
];

export default function ExampleForTripLeadersKit() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]); 
  const [fetching, setFetching] = useState(true); 
  const [fetchError, setFetchError] = useState(""); 
  const [openError, setOpenError] = useState(""); 

  const [allFiles, setAllFiles] = useState([]); 
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [filesError, setFilesError] = useState(""); 

  async function fetchTemplates() {
    if (!canManageTrip()) return;

    try {
      setFetching(true);
      setFetchError("");
      const res = await api.get(`/api/trips/${EXAMPLE_TRIP_ID}/templates`);
      setTemplates(res.data || []);
    } catch {
      setFetchError("לא ניתן לטעון את תבניות הדוגמה כרגע");
    } finally {
      setFetching(false);
    }
  }

  async function fetchAllFiles() {
    if (!canManageTrip()) return;

    try {
      setFetchingFiles(true);
      setFilesError("");
      const res = await api.get(
        `/api/trips/${EXAMPLE_TRIP_ID}/templates/files`,
      );
      setAllFiles(res.data || []);
    } catch {
      setFilesError("לא ניתן לטעון את רשימת קבצי התבניות כרגע");
    } finally {
      setFetchingFiles(false);
    }
  }

  useEffect(() => {
    fetchTemplates();
    fetchAllFiles();
  }, []);

  const templatesByCode = {};
  templates.forEach((t) => {
    if (t.file_code) templatesByCode[t.file_code] = t;
  });

  async function handleDownloadFile(fileName) {
    setOpenError("");
    try {
      const response = await api.get(
        `/api/trips/${EXAMPLE_TRIP_ID}/templates/files/${encodeURIComponent(fileName)}`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setOpenError(
        `הקובץ "${fileName}" עדיין לא הוצב בתיקיית התבניות בשרת. יש להוסיף את קובץ ה-PDF בהתאם להנחיות.`,
      );
    }
  }

  if (!canManageTrip()) {
    return <Navigate to="/unauthorized" replace />;
  }

  const requiredDone = REQUIRED_DOCS.filter(
    (d) => templatesByCode[d.fileCode],
  ).length;

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div
          className="form-section"
          style={{
            background: "#fef9c3",
            border: "2px solid #f59e0b",
            marginBottom: "1.5rem",
          }}
        >
          <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>
            דוגמה ומדריך למילוי אוגדן ותיק טיול
          </h1>
          <p className="form-section-hint">
            עמוד זה מציג דוגמה מלאה למבנה תיק הטיול, ובו תבנית PDF ריקה
            לכל אחד מ-11 המסמכים הנדרשים באוגדן הטיולים. ניתן לצפות בכל תבנית,
            להוריד אותה ולמלא אותה כדוגמה למסמך שיש להעלות לתיק הטיול האמיתי.
            עמוד זה הינו עמוד הדגמה בלבד — אינו מהווה טיול פעיל ואינו שומר
            נתונים בבסיס הנתונים.
          </p>
        </div>

        <div className="kit-page-header">
          <div>
            <h2 className="page-title" style={{ marginBottom: 4 }}>
              תיק הטיול — דוגמה מלאה
            </h2>
            <p className="form-section-hint">
              {fetching
                ? "טוען נתוני דוגמה..."
                : `${requiredDone}/${REQUIRED_DOCS.length} מסמכי חובה (תבניות לדוגמה)`}
            </p>
          </div>
          <button
            className="trip-form-btn trip-form-btn--ghost"
            onClick={() => navigate("/trips")}
          >
            חזרה לרשימת הטיולים
          </button>
        </div>

        {fetchError && (
          <p
            className="error form-submit-error"
            style={{ marginBottom: "1.5rem" }}
          >
            {fetchError}
          </p>
        )}

        <div className="kit-progress-bar-wrap">
          <div
            className="kit-progress-bar-fill"
            style={{ width: `${(requiredDone / REQUIRED_DOCS.length) * 100}%` }}
          />
        </div>

        <section className="form-section" style={{ marginTop: "1.5rem" }}>
          <h2 className="form-section-title">מסמכי חובה — תיק הטיול (דוגמה)</h2>
          <p className="form-section-hint">
            כל כרטיס מציג תבנית PDF ריקה לדוגמה התואמת לאחד מהמסמכים הנדרשים
            לפי אוגדן הטיולים 2025, בתוספת הסבר קצר על תוכן המסמך הנדרש.
          </p>
          <a href="https://www.gov.il/BlobFolder/policy/youth-trips/he/manpower-training_youth_trips-2025.pdf">
            לאוגדן טיולים מלא לחץ כאן
          </a>

          {openError && (
            <p className="error form-submit-error" style={{ marginTop: "1rem" }}>
              {openError}
            </p>
          )}

          <div className="kit-required-grid">
            {REQUIRED_DOCS.map((doc) => {
              const template = templatesByCode[doc.fileCode];
              return (
                <div
                  key={doc.fileCode}
                  className={`kit-doc-card ${template ? "kit-doc-card--done" : ""}`}
                >
                  <div className="kit-doc-header">
                    <span
                      className={`kit-doc-badge ${template ? "kit-doc-badge--done" : ""}`}
                    >
                      {template ? "✓" : doc.fileCode}
                    </span>
                    <h3 className="kit-doc-title">{doc.title}</h3>
                  </div>

                  <p
                    className="form-section-hint"
                    style={{ margin: "0.25rem 0 0.5rem" }}
                  >
                    {doc.hint}
                  </p>

                  {template && (
                    <div className="kit-doc-uploaded-row">
                      <span className="kit-doc-filename">
                        {template.original_name}
                      </span>
                      <span className="kit-doc-ok-label">תבנית ריקה</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="trip-form-btn trip-form-btn--ghost"
                    onClick={() => handleDownloadFile(template.original_name)}
                    disabled={!template}
                    style={{ width: "100%" }}
                  >
                    הורדת התבנית הריקה
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">
           כל הקבצים בתיקיית התבניות לדוגמה - מתוך אוגדן טיולים מלא, קבצים מפוצלים
          </h2>
          <p className="form-section-hint">
            רשימה זו מציגה את כל קובצי ה-PDF שהוצבו בתיקיית התבניות בשרת —
            כוללת גם תבניות ריקות וגם מסמכי עזר ואסמכתאות נוספים. ניתן להוריד
            כל קובץ בנפרד באמצעות הכפתור שלצידו.
          </p>

          {fetchingFiles && <p className="form-section-hint">טוען רשימת קבצים...</p>}

          {filesError && (
            <p className="error form-submit-error">{filesError}</p>
          )}

          {!fetchingFiles && !filesError && allFiles.length === 0 && (
            <p className="form-section-hint">
              תיקיית התבניות עדיין ריקה. יש להוסיף לתוכה קבצי PDF בהתאם
              להנחיות.
            </p>
          )}

          {allFiles.length > 0 && (
            <ul className="kit-files-list">
              {allFiles.map((fileName) => (
                <li key={fileName} className="kit-file-row">
                  <span className="kit-file-icon">📄</span>
                  <span className="kit-file-name">{fileName}</span>
                  <button
                    type="button"
                    className="trip-form-btn trip-form-btn--ghost kit-open-btn"
                    onClick={() => handleDownloadFile(fileName)}
                  >
                    הורדה
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
