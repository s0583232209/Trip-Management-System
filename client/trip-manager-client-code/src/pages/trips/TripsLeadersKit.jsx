import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import UploadTripFile from "./UploadTripFile.jsx";
import { getTripFiles, openFile } from "../../services/files.service.js";
import "./TripsPage.css";
import "./TripForms.css";
import "./TripsLeadersKit.css";

const REQUIRED_DOCS = [
  { fileCode: 1,  title: "מינוי אחראי טיול" },
  { fileCode: 2,  title: "אישור יציאה לטיול ממנהל מוסד" },
  { fileCode: 3,  title: "אישורי הורים" },
  { fileCode: 4,  title: "רשימת תלמידים" },
  { fileCode: 5,  title: "רשימת תלמידים עם מגבלות רפואיות" },
  { fileCode: 6,  title: "טופס הפניה לטיפול רפואי לתלמיד שנפגע במהלך טיול" },
  { fileCode: 7,  title: "רשימת תלמידים שנפגעו במהלך טיול" },
  { fileCode: 8,  title: "טופס ביטוח למתנדב" },
  { fileCode: 9,  title: "רשימת מלווים וטלפונים חיוניים בטיול" },
  { fileCode: 10, title: "הנחיות למורה אחראי כיתה" },
  { fileCode: 11, title: "טופס תיאום טיולים מאושר" },
];

export default function TripsLeadersKit() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fetching, setFetching]           = useState(true);
  const [fetchError, setFetchError]       = useState("");

  // extra non-required upload slots added by the user
  const [additionalSlots, setAdditionalSlots] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, [tripId]);

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

  // בנייה מהשרת — שומרת על מצב גם אחרי רענון דף
  const uploadedByCode = {};
  uploadedFiles.forEach((f) => {
    if (f.file_code) uploadedByCode[f.file_code] = f;
  });

  function handleRequiredUpload() {
    fetchFiles();
  }

  function handleAdditionalUpload() {
    fetchFiles();
  }

  function addExtraSlot() {
    setAdditionalSlots((prev) => [...prev, Date.now()]);
  }

  function removeExtraSlot(key) {
    setAdditionalSlots((prev) => prev.filter((k) => k !== key));
  }

  const doneCount = Object.keys(uploadedByCode).length;

  return (
    <>
      <Navbar />
      <main className="page-main">

        {/* ─── כותרת עמוד ─── */}
        <div className="kit-page-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              תיק הטיול
            </h1>
            <p className="form-section-hint">
              {fetching
                ? "טוען נתונים..."
                : `${doneCount} מתוך ${REQUIRED_DOCS.length} מסמכי חובה הועלו · סה״כ ${uploadedFiles.length} קבצים בטיול`}
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
          <p className="error form-submit-error" style={{ marginBottom: "1.5rem" }}>
            {fetchError}
          </p>
        )}

        {/* ─── פס התקדמות ─── */}
        <div className="kit-progress-bar-wrap">
          <div
            className="kit-progress-bar-fill"
            style={{ width: `${(doneCount / REQUIRED_DOCS.length) * 100}%` }}
          />
        </div>

        {/* ─── מסמכי חובה ─── */}
        <section className="form-section" style={{ marginTop: "1.5rem" }}>
          <h2 className="form-section-title">מסמכי חובה — תיק הטיול</h2>
          <p className="form-section-hint">
            יש להעלות את כל המסמכים הנדרשים לפי אוגדן הטיולים 2025.
            מסמך שהועלה מסומן בירוק.
          </p>

          <div className="kit-required-grid">
            {REQUIRED_DOCS.map((doc) => {
              const uploaded = uploadedByCode[doc.fileCode];
              return (
                <div
                  key={doc.fileCode}
                  className={`kit-doc-card ${uploaded ? "kit-doc-card--done" : ""}`}
                >
                  <div className="kit-doc-header">
                    <span className={`kit-doc-badge ${uploaded ? "kit-doc-badge--done" : ""}`}>
                      {uploaded ? "✓" : doc.fileCode}
                    </span>
                    <h3 className="kit-doc-title">{doc.title}</h3>
                  </div>

                  {uploaded && (
                    <div className="kit-doc-uploaded-row">
                      <span className="kit-doc-filename">{uploaded.original_name}</span>
                      <span className="kit-doc-ok-label">הועלה</span>
                    </div>
                  )}

                  <UploadTripFile
                    compact
                    tripId={tripId}
                    fileCode={doc.fileCode}
                    existingFile={uploaded || null}
                    onUploadSuccess={handleRequiredUpload}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── קבצים נוספים ─── */}
        <section className="form-section">
          <h2 className="form-section-title">קבצים נוספים לתיק הטיול</h2>
          <p className="form-section-hint">
            ניתן להוסיף כל מסמך נוסף שאינו ברשימת החובה.
          </p>

          {additionalSlots.map((key, i) => (
            <div key={key} className="kit-doc-card" style={{ marginBottom: "1rem" }}>
              <div className="kit-doc-header">
                <span className="kit-doc-badge">{REQUIRED_DOCS.length + i + 1}</span>
                <h3 className="kit-doc-title">מסמך נוסף {i + 1}</h3>
                <button
                  type="button"
                  className="stop-remove-btn"
                  style={{ marginRight: "auto" }}
                  onClick={() => removeExtraSlot(key)}
                >
                  הסר
                </button>
              </div>
              <UploadTripFile
                compact
                tripId={tripId}
                documentType={`extra_${i + 1}`}
                onUploadSuccess={handleAdditionalUpload}
              />
            </div>
          ))}

          <button
            type="button"
            className="add-stop-btn"
            onClick={addExtraSlot}
          >
            + הוסף מסמך נוסף לתיק הטיול
          </button>
        </section>

        {/* ─── רשימת כל הקבצים שהועלו ─── */}
        {!fetching && uploadedFiles.length > 0 && (
          <section className="form-section">
            <h2 className="form-section-title">
              כל הקבצים שהועלו לטיול ({uploadedFiles.length})
            </h2>
            <ul className="kit-files-list">
              {uploadedFiles.map((file) => (
                <li key={file.id} className="kit-file-row">
                  <span className="kit-file-icon">📄</span>
                  <span className="kit-file-name">{file.original_name}</span>
                  {(file.uploaded_at || file.created_at) && (
                    <span className="kit-file-date">
                      {new Date(
                        file.uploaded_at || file.created_at,
                      ).toLocaleDateString("he-IL")}
                    </span>
                  )}
                  <button
                    type="button"
                    className="trip-form-btn trip-form-btn--ghost kit-open-btn"
                    onClick={() => openFile(tripId, file.id)}
                  >
                    פתח
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

      </main>
    </>
  );
}
