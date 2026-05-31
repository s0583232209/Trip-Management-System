import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
// import { appContext } from "../App";
import api from "../api";
import { useState } from "react";
import SchoolDetails from "../components/SchoolDetails.jsx";
import UserDetails from "../components/UserDetails.jsx";
import './Auth.css'
export default function Auth() {
  const [error, setError] = useState();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate(); 
  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  // const { setUserId } = useContext(appContext);

  async function submitStep(data) {
    // if (data.password !== data.verifyPassword) {
    //   setError("Passwords do not match.");
    //   return;
    // }
    try {
      const response = await api.post("/api/auth/register", data);
      const user = response.data;
      if (!user)
        throw new Error("This user name isn't valid, please try another one");
      const userId = user.userId || user.id;
      sessionStorage.setItem(
        "current-user",
        JSON.stringify({ userId, email: user.email, name: user.name }),
      );
      setUserId(userId);
      navigate("/");
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="auth-page">
      {/* Right form panel */}
      <div className="auth-form-panel auth-form-panel--scroll">
        <p className="auth-form-heading">יצירת חשבון</p>
        <SchoolDetails onSubmit={submitStep} />
        <UserDetails onSubmit={submitStep} />
        <p className="auth-form-sub">
          Fill in your details below to get started
        </p>
        <form id="loginForm" onSubmit={handleSubmit(submitStep)}>
          <label htmlFor="nationalId">מספר תעודת זהות</label>
          <input
            type="text"
            id="nationalId"
            autoComplete="nationalId"
            {...register("nationalId")}
          />

          <label htmlFor="password">סיסמה</label>
          <input
            type="password"
            id="password"
            autoComplete="new-password"
            {...register("password")}
          />

          <p className="errorLog">{error}</p>
          <button type="submit">יצירת חשבון</button>
        </form>
        <p className="auth-alt-link">
          יצירת חשבון בית-ספרי חדש
          <button type="button" onClick={() => navigate("/register")}>
            צור חשבון
          </button>
        </p>
      </div>
    </div>
  );
}
