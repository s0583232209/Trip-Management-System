import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { appContext } from "../App";
import api from "../api";
import { useState } from "react";

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 30 30" fill="none">
    <defs>
      <linearGradient id="rl" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#95d5b2" /><stop offset="1" stopColor="#52b788" />
      </linearGradient>
    </defs>
    <rect width="30" height="30" rx="8" fill="url(#rl)" />
    <path d="M8 8v14l14-14v14" stroke="white" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export default function Register() {
  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  const { setUserId } = useContext(appContext);
  const [error, setError] = useState();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  async function submitStep(data) {
    if (data.password !== data.verifyPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await api.post("/api/auth/register", data);
      const user = response.data;
      if (!user) throw new Error("This user name isn't valid, please try another one");
      const userId = user.userId || user.id;
      sessionStorage.setItem("current-user", JSON.stringify({ userId, email: user.email, name: user.name }));
      setUserId(userId);
      navigate("/");
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-logo-wrap">
          <Logo />
          <span className="auth-brand-logo-name">Nexus</span>
        </div>
        <h2 className="auth-brand-headline">Join Nexus<br />today.</h2>
        <p className="auth-brand-sub">
          Create your account and start managing your work in one clean, powerful place.
        </p>
        <div className="auth-features">
          {["Personal workspace", "Manage posts & tasks", "Track your progress", "Edit your profile anytime"].map(f => (
            <div className="auth-feature" key={f}>
              <span className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel auth-form-panel--scroll">
        <p className="auth-form-heading">Create account</p>
        <p className="auth-form-sub">Fill in your details below to get started</p>
        <form onSubmit={handleSubmit(submitStep)}>
          <label htmlFor="nationalId">מספר תעודת זהות</label>
          <input type="text" id="nationalId" autoComplete="nationalId" {...register("nationalId")} />

          <label htmlFor="password">סיסמה</label>
          <input type="password" id="password" autoComplete="new-password" {...register("password")} />

          <p className="errorLog">{error}</p>
          <button type="submit">Create Account</button>
        </form>
        <p className="auth-alt-link">
          Already have an account?
          <button type="button" onClick={() => navigate("/login")}>Sign in</button>
        </p>
      </div>
    </div>
  );
}
