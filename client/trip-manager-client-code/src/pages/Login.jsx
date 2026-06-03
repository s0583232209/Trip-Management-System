import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Login.css";

export default function Auth() {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nationalId: "",
    institutionNumber: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  function updateField(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (
      !formData.nationalId ||
      !formData.institutionNumber ||
      !formData.password
    ) {
      setError("יש למלא את כל שדות הכניסה");
      return;
    }
    try {
      const response = await api.post("/api/auth/login", formData);
      const user = response.data;
      sessionStorage.setItem(
        "current-user",
        JSON.stringify({
          userId: user.userId,
          role: user.role,
          nationalId: user.nationalId,
        }),
      );
      navigate("/");
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const normalized = serverMessage?.toLowerCase() || "";
      let message = "שם משתמש או סיסמה שגויים";

      if (normalized.includes("user not found")) {
        message = "משתמש לא נמצא";
      } else if (
        normalized.includes("incorrect password") ||
        normalized.includes("invalid credentials")
      ) {
        message = "סיסמה שגויה";
      } else if (err.response?.status >= 500) {
        message = "אירעה תקלה בשרת, נסה שוב מאוחר יותר";
      }

      setError(message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-form-panel">
        <p className="auth-form-heading">כניסה למערכת</p>
        <form onSubmit={handleLogin} noValidate>
          <label htmlFor="nationalId">מספר תעודת זהות</label>
          <input
            type="text"
            id="nationalId"
            name="nationalId"
            value={formData.nationalId}
            onChange={updateField}
          />

          <label htmlFor="institutionNumber">סמל מוסד</label>
          <input
            type="text"
            inputMode="numeric"
            id="institutionNumber"
            name="institutionNumber"
            value={formData.institutionNumber}
            onChange={updateField}
          />

          <label htmlFor="password">סיסמה</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={updateField}
          />

          <p className="errorLog">{error}</p>
          <button type="submit">כניסה</button>
        </form>
        <p className="auth-alt-link">
          מנהל חדש? רשום בית ספר
          <button type="button" onClick={() => navigate("/register")}>
            יצירת חשבון
          </button>
        </p>
      </div>
    </div>
  );
}
