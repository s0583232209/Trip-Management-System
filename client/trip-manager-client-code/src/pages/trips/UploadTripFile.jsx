import { useState, useId } from "react";
import api from "../../api.js";
import { openFile } from "../../services/files.service.js";
import "./TripForms.css";

// UploadTripFile.jsx

export default function UploadTripFile({
  tripId,
  documentType,
  fileCode,
  existingFile,
  onUploadSuccess,
  compact = false,
}) {
  const inputId = useId();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  }

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

    const url = fileCode != null
      ? `api/trips/${tripId}/files/kit`
      : `api/trips/${tripId}/files`;

    try {
      const response = await api.post(url, formData);
      console.log(response);
      setSuccessMessage("הקובץ הועלה בהצלחה!");
      setFile(null);
      setDescription("");

      const fileInput = document.getElementById(inputId);
      if (fileInput) fileInput.value = "";

      // הפעלת פונקציית Callback במידה וההורה רוצה לרענן את רשימת הקבצים
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "העלאת הקובץ נכשלה, אנא נסה שנית",
      );
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
        </form>
      </section>
    </div>
  );
}
