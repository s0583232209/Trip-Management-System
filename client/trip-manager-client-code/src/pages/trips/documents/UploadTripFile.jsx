import { useState, useId } from "react";
import api from "../../../api.js";
import { openFile, deleteTripFile } from "../../../services/files.service.js";
import { canManageTrip } from "../../../permissions.js";
import "../TripForms.css";

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

  async function handleDelete() {
    if (!existingFile) return;
    if (!window.confirm("האם למחוק את הקובץ? לא ניתן לשחזר לאחר המחיקה.")) return;
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      await deleteTripFile(tripId, existingFile.id);
      setSuccessMessage("הקובץ נמחק בהצלחה");
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(getErrorMessage(err, "מחיקת הקובץ נכשלה, אנא נסה שנית"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!file) { setError("אנא בחר קובץ להעלאה"); return; }
    setLoading(true);
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
      setSuccessMessage("הקובץ הועלה בהצלחה!");
      setFile(null);
      setDescription("");
      const fileInput = document.getElementById(inputId);
      if (fileInput) fileInput.value = "";
      if (onUploadSuccess) onUploadSuccess(response.data);
    } catch (err) {
      setError(getErrorMessage(err, "העלאת הקובץ נכשלה, אנא נסה שנית"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "upload-form--compact" : "upload-form"}>
      <section className="form-section">
        {!compact && <h2>העלאת מסמך / קובץ לטיול</h2>}

        {existingFile && (
          <button
            type="button"
            className="kit-existing-file-link"
            onClick={() => openFile(tripId, existingFile.id)}
          >
            {existingFile.original_name || existingFile.fileName}
          </button>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor={inputId}>בחר קובץ (PDF, PNG או JPG, עד 5MB)</label>

          <label htmlFor={inputId} className="file-input-label">
            <span className="file-input-label__icon">📎</span>
            <span className="file-input-label__text">
              {file ? file.name : "בחר קובץ..."}
            </span>
          </label>
          <input
            id={inputId}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            required
            onChange={handleFileChange}
            disabled={loading}
            className="file-input-hidden"
          />

          <label>תיאור הקובץ</label>
          <input
            type="text"
            placeholder="לדוגמה: אישור בטחוני, תוכנית לו''ז"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          {error && <p className="error">{error}</p>}
          {successMessage && <p className="form-success">{successMessage}</p>}

          <div className="form-actions-row upload-form__actions">
            <button
              type="submit"
              className="trip-form-btn trip-form-btn--primary upload-form__btn"
              disabled={loading}
            >
              {loading ? "מעלה..." : existingFile ? "החלף קובץ" : "העלה קובץ"}
            </button>
          </div>

          {existingFile && canManageTrip() && (
            <div className="form-actions-row upload-form__actions">
              <button
                type="button"
                className="trip-form-btn trip-form-btn--danger upload-form__btn"
                disabled={loading}
                onClick={handleDelete}
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
