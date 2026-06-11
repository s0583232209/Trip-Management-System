import { useState, useId } from "react";
import api from "../../api.js";
import { openFile, deleteTripFile } from "../../services/files.service.js";
import { canManageTrip } from "../../permissions.js";
import "./TripForms.css";

// UploadTripFile.jsx
// קומפוננטה גנרית להעלאה/החלפה/מחיקה של קובץ בודד.
// משמשת גם עבור מסמכי "תיק הטיול" (יש fileCode + existingFile) וגם עבור קבצים נוספים (ללא fileCode).

// פונקציית עזר משותפת: מחלצת הודעת שגיאה קריאה מתוך שגיאת axios,
// כדי לא לשכפל את אותה שרשרת ?? בכל בלוק catch
function getErrorMessage(err, fallback) {
  return err.response?.data?.message || err.response?.data || fallback;
}

export default function UploadTripFile({
  tripId,
  documentType,
  fileCode,
  existingFile,
  onUploadSuccess,
  compact = false,
}) {
  const inputId = useId(); // מזהה ייחודי ל-input הקובץ, כדי שכל מופע של הקומפוננטה יהיה עצמאי
  const [file, setFile] = useState(null); // הקובץ שנבחר ע"י המשתמש (עדיין לא נשלח)
  const [description, setDescription] = useState(""); // תיאור חופשי לקובץ
  const [loading, setLoading] = useState(false); // האם בקשה (העלאה/מחיקה) באמצע ביצוע
  const [error, setError] = useState(""); // הודעת שגיאה להצגה
  const [successMessage, setSuccessMessage] = useState(""); // הודעת הצלחה להצגה

  // נקרא בכל פעם שהמשתמש בוחר קובץ חדש מה-input
  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  }

  // מוחק את הקובץ הקיים (existingFile) בלי להעלות קובץ חלופי במקומו
  async function handleDelete() {
    if (!existingFile) return;
    if (!window.confirm("האם למחוק את הקובץ? לא ניתן לשחזר לאחר המחיקה.")) return;

    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await deleteTripFile(tripId, existingFile.id);
      setSuccessMessage("הקובץ נמחק בהצלחה");
      // מרעננים את רשימת הקבצים אצל ההורה (אם הוגדרה פונקציית callback)
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(getErrorMessage(err, "מחיקת הקובץ נכשלה, אנא נסה שנית"));
    } finally {
      setLoading(false);
    }
  }

  // שולח את הקובץ שנבחר לשרת — יוצר מסמך חדש, או מחליף מסמך קיים אם יש fileCode תואם
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!file) {
      setError("אנא בחר קובץ להעלאה");
      return;
    }

    setLoading(true);

    // יצירת אובייקט FormData להתאמה ל-Multer בשרת
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tripId", tripId);
    formData.append("documentType", documentType);
    formData.append("description", description);
    if (fileCode != null) formData.append("fileCode", fileCode);

    // מסמך תיק-טיול (יש fileCode) הולך ל-/files/kit, קובץ רגיל הולך ל-/files
    const url = fileCode != null
      ? `api/trips/${tripId}/files/kit`
      : `api/trips/${tripId}/files`;

    try {
      const response = await api.post(url, formData);
      setSuccessMessage("הקובץ הועלה בהצלחה!");

      // איפוס הטופס לאחר העלאה מוצלחת
      setFile(null);
      setDescription("");
      const fileInput = document.getElementById(inputId);
      if (fileInput) fileInput.value = "";

      // הפעלת פונקציית Callback במידה וההורה רוצה לרענן את רשימת הקבצים
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err, "העלאת הקובץ נכשלה, אנא נסה שנית"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="trip-form"
      style={
        compact
          ? {
              maxWidth: "100%",
              margin: 0,
              padding: 0,
              boxShadow: "none",
              border: "none",
            }
          : {
              maxWidth: "500px",
              margin: "1rem auto",
            }
      }
    >
      <section className="form-section">
        {!compact && <h2>העלאת מסמך / קובץ לטיול</h2>}

        {/* אם כבר קיים קובץ עבור הסלוט הזה — מציגים קישור לפתיחתו */}
        {existingFile && (
          <button
            type="button"
            className="kit-existing-file-link"
            onClick={() => openFile(tripId, existingFile.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "right",
              background: "none",
              border: "none",
              padding: 0,
              marginBottom: "0.75rem",
              color: "var(--sky-dark)",
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {existingFile.original_name || existingFile.fileName}
          </button>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor={inputId}>בחר קובץ (עד 20MB)</label>
          <input
            id={inputId}
            type="file"
            required
            onChange={handleFileChange}
            disabled={loading}
            style={{ marginBottom: "1rem" }}
          />

          <label>תיאור הקובץ</label>
          <input
            type="text"
            placeholder="לדוגמה: אישור בטחוני, תוכנית לו''ז"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          {error && (
            <p className="error" style={{ marginTop: "0.5rem" }}>
              {error}
            </p>
          )}
          {successMessage && (
            <p
              style={{
                color: "green",
                marginTop: "0.5rem",
                fontWeight: "bold",
              }}
            >
              {successMessage}
            </p>
          )}

          {/* כפתור שליחה: "העלה" אם אין קובץ קיים, "החלף" אם יש */}
          <div className="form-actions-row" style={{ marginTop: "1.5rem" }}>
            <button
              type="submit"
              className="trip-form-btn trip-form-btn--primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "מעלה..." : existingFile ? "החלף קובץ" : "העלה קובץ"}
            </button>
          </div>

          {/* כפתור מחיקה ללא החלפה — מוצג רק כשיש קובץ קיים ולמשתמש יש הרשאת ניהול טיול */}
          {existingFile && canManageTrip() && (
            <div className="form-actions-row" style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                className="trip-form-btn trip-form-btn--danger"
                disabled={loading}
                onClick={handleDelete}
                style={{ width: "100%" }}
              >
                מחק קובץ
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
