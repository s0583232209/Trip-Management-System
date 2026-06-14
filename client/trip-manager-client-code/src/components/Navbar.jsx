import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import icon from "../assets/icon.png";
import { useEffect, useRef } from "react";
import "./Navbar.css";
import { logout } from "../store/authSlice.js";
import { clearEmergencyAlert, muteEmergencySound } from "../store/emergencySlice.js";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const alert = useSelector((state) => state.emergency.activeAlert);
  const soundMuted = useSelector((state) => state.emergency.soundMuted);
  const userRoles = user?.roles || (user?.role ? [user.role] : []);

  const audioIntervalRef = useRef(null);
  const audioTimeoutRef = useRef(null);
  const audioCtxRef = useRef(null);

  function handleLogout() {
    stopAlertSound();
    dispatch(logout());
    navigate("/login");
  }

  useEffect(() => {
    if (alert && !soundMuted) {
      startAlertSoundLoop();
    } else {
      stopAlertSound();
    }
    return () => stopAlertSound();
  }, [alert, soundMuted]);

  function startAlertSoundLoop() {
    stopAlertSound();
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      const playPulse = () => {
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state === "closed") return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      };
      playPulse();
      audioIntervalRef.current = setInterval(playPulse, 500);
      audioTimeoutRef.current = setTimeout(() => stopAlertSound(), 60000);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  }

  function stopAlertSound() {
    if (audioIntervalRef.current) { clearInterval(audioIntervalRef.current); audioIntervalRef.current = null; }
    if (audioTimeoutRef.current) { clearTimeout(audioTimeoutRef.current); audioTimeoutRef.current = null; }
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }

  const isCritical = alert?.emergency_type_id === 2;
  const alertTripId = alert?.trip_id;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <img src={icon} alt="לוגו" className="navbar-logo" />
          <span className="navbar-title">מסלול בטוח</span>
        </div>
        <div className="navbar-links">
          <button className="navbar-btn" onClick={() => navigate("/")}>בית</button>
          <button className="navbar-btn" onClick={() => navigate("/trips")}>טיולים</button>
          <button className="navbar-btn" onClick={() => navigate("/profile")}>פרופיל</button>
          {userRoles.includes("principal") && (
            <button className="navbar-btn" onClick={() => navigate("/add-employee")}>ניהול</button>
          )}
        </div>
        <div className="navbar-actions">
          <button className="navbar-btn navbar-btn--logout" onClick={handleLogout}>התנתקות</button>
        </div>
      </nav>

      {alert && (
        <div className={`navbar-emergency-banner`}>
          <span className="navbar-emergency-banner__icon">
            {isCritical ? "🚨" : "⚠️"}
          </span>
          <span className="navbar-emergency-banner__text">
            <strong>{isCritical ? "חירום קריטי" : "חירום מינורי"}:</strong>
            {alert.description}
          </span>
          <div className="navbar-emergency-banner__actions">
            <button
              onClick={() => { stopAlertSound(); navigate(`/trips/${alertTripId}/emergencies`); }}
              className="navbar-emergency-banner__btn-view"
            >
              צפה בפרטים
            </button>
            <button
              onClick={() => { stopAlertSound(); dispatch(clearEmergencyAlert()); }}
              className="navbar-emergency-banner__btn-close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
