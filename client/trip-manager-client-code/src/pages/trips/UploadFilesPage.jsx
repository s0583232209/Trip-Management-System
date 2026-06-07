import { useState } from "react";
import api from "../../api.js";
import "./TripForms.css";

export default function UploadTripFile({ tripId, onUploadSuccess }) {
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
    formData.append("file", file); // תואם ל-req.file בשרת
    formData.append("tripId", 1); // תואם ל-req.body.tripId
    formData.append("description", description); // תואם ל-req.body.description

    try {
      // שליחת הבקשה עם ה-FormData. Axios יגדיר את ה-Content-Type המתאים אוטומטית
      const response = await api.post("api/trips/1/files", formData);
      console.log(response);
      setSuccessMessage("הקובץ הועלה בהצלחה!");
      setFile(null);
      setDescription("");

      // איפוס שדה ה-Input בקוד ידני
      const fileInput = document.getElementById("trip-file-input");
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
      style={{ maxWidth: "500px", margin: "1rem auto" }}
    >
      <section className="form-section">
        <h3 className="form-section-title">העלאת מסמך / קובץ לטיול</h3>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="trip-file-input">בחר קובץ (עד 20MB)</label>
          <input
            id="trip-file-input"
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
              {loading ? "מעלה קובץ..." : "העלה קובץ לשרת"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
