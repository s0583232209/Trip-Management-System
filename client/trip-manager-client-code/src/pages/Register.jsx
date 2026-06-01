import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import SchoolDetails from "../components/SchoolDetails.jsx";
import UserDetails from "../components/UserDetails.jsx";
import "./Login.css";

export default function Register() {
  const [step, setStep] = useState(1);
  const [schoolData, setSchoolData] = useState(null);
  const [error, setError] = useState();
  const navigate = useNavigate();

  function handleSchoolSubmit(data) {
    setSchoolData(data);
    setStep(2);
  }

  async function handleUserSubmit(userData) {
    try {
      const response = await api.post("/api/auth/register", {
        ...schoolData,
        ...userData,
        role: "principal",
      });
      const user = response.data;
      sessionStorage.setItem("current-user", JSON.stringify({ userId: user.userId, role: user.role, nationalId: user.nationalId }));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "הרישום נכשל, נסה שנית");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-form-panel auth-form-panel--scroll">
        <p className="auth-form-heading">{step === 1 ? "פרטי מוסד" : "פרטי מנהל"}</p>
        {step === 1 && <SchoolDetails onSubmit={handleSchoolSubmit} />}
        {step === 2 && <UserDetails onSubmit={handleUserSubmit} />}
        {error && <p className="errorLog">{error}</p>}
        <p className="auth-alt-link">
          כבר יש חשבון?
          <button type="button" onClick={() => navigate("/login")}>כניסה</button>
        </p>
      </div>
    </div>
  );
}
