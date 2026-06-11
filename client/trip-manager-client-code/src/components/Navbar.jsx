import { useNavigate } from "react-router-dom";
import icon from "../assets/icon.png";
import { useEffect, useState, useRef } from "react";
import "./Navbar.css";
import api from "../api.js";
import socket from "../socket.js";

export default function Navbar() {
  const navigate = useNavigate();
  const [tripDayOfTrip, setTripDayOfTrip] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isMuted, setIsMuted] = useState(false); // מעקב האם המשתמש השתיק ידנית

  const user = JSON.parse(sessionStorage.getItem("current-user"));

  // שימוש ברפרנסים לניהול מחזור חיי האודיו וטיימרים
  const audioIntervalRef = useRef(null);
  const audioTimeoutRef = useRef(null);
  const audioCtxRef = useRef(null);

  function handleLogout() {
    stopAlertSound();
    sessionStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    async function getTrips() {
      try {
        const res = await api.get("/api/trips");
        const trips = res.data;
        if (!trips || !trips.length) return;
        for (let i = 0; i < trips.length; i++) {
          if (
            new Date(trips[i].trip_date).toDateString() ===
            new Date().toDateString()
          ) {
            setTripDayOfTrip(trips[i].id);
            break;
          }
        }
      } catch (err) {
        console.error("Navbar trips fetch error", err);
      }
    }
    getTrips();
  }, []);

  useEffect(() => {
    if (!tripDayOfTrip) return;
    socket.emit("join-trip", tripDayOfTrip);
    socket.on("emergency-alert", (data) => {
      setAlert(data.emergency);
      setIsMuted(false); // איפוס השתקה עבור אירוע חדש שמגיע
    });
    socket.on("emergency-closed", () => {
      setAlert(null);
    });
    return () => {
      socket.emit("leave-trip", tripDayOfTrip);
      socket.off("emergency-alert");
      socket.off("emergency-closed");
    };
  }, [tripDayOfTrip]);

  // אפקט המפעיל ומכבה את מנגנון הסירנה בהתאם למצב ההתראה וההשתקה
  useEffect(() => {
    if (alert && !isMuted) {
      startAlertSoundLoop();
    } else {
      stopAlertSound();
    }

    // ניקוי טיימרים ואודיו במידה והקומפוננטה יוצאת מהמסך
    return () => stopAlertSound();
  }, [alert, isMuted]);

  function startAlertSoundLoop() {
    // מניעת כפילויות לולאות קודמות
    stopAlertSound();

    try {
      // יצירת AudioContext יחיד שישמש את כל מחזור הסירנה הנוכחי
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();

      // פונקציית פולס בודד של צפצוף (מנוגנת כל 0.5 שנייה)
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
        // דעיכה חלקה כדי למנוע רעשי קליק דיגיטליים בסוף הפולס
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      };

      // השמעת הפולס הראשון מיידית
      playPulse();

      // הפעלת לולאה חוזרת של צפצופים מקוטעים
      audioIntervalRef.current = setInterval(playPulse, 500);

      // הגבלת זמן: עצירת הלולאה באופן אוטומטי לאחר דקה אחת (60,000 מילישניות)
      audioTimeoutRef.current = setTimeout(() => {
        stopAlertSound();
        setIsMuted(true); // סימון כהושתק כדי שלא יתחיל מחדש באופן ספונטני
      }, 60000);
    } catch (e) {
      console.warn(
        "Audio Context implementation failed or blocked by browser auto-play policy",
        e,
      );
    }
  }

  function stopAlertSound() {
    // 1. עצירת לולאת האינטרוולים
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    // 2. ביטול טיימר השעון המעורר של הדקה
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
    }
    // 3. סגירת ה-Audio Context לחלוטין לשחרור משאבי מערכת השמע של הדפדפן
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch((err) => console.log(err));
      }
      audioCtxRef.current = null;
    }
  }

  const isCritical = alert?.emergencyTypeId >= 2;

  return (
    <>
      <nav className="navbar">
        <div
          className="navbar-brand"
          onClick={() => {
            stopAlertSound();
            navigate("/");
          }}
        >
          <img src={icon} alt="לוגו" className="navbar-logo" />
          <span className="navbar-title">מסלול בטוח</span>
        </div>
        <div className="navbar-links">
          <button
            className="navbar-btn"
            onClick={() => {
              stopAlertSound();
              navigate("/");
            }}
          >
            בית
          </button>
          <button
            className="navbar-btn"
            onClick={() => {
              stopAlertSound();
              navigate("/trips");
            }}
          >
            טיולים
          </button>
          <button
            className="navbar-btn"
            onClick={() => {
              stopAlertSound();
              navigate("/media");
            }}
          >
            מדיה
          </button>
          <button
            className="navbar-btn"
            onClick={() => {
              stopAlertSound();
              navigate("/profile");
            }}
          >
            פרופיל
          </button>
          {user?.role === "principal" && (
            <button
              className="navbar-btn"
              onClick={() => {
                stopAlertSound();
                navigate("/add-employee");
              }}
            >
              ניהול
            </button>
          )}
        </div>
        <div className="navbar-actions">
          {user?.role === "principal" && (
            <button
              className="navbar-btn"
              onClick={() => {
                stopAlertSound();
                navigate("/add-employee");
              }}
            >
              הוספת עובד
            </button>
          )}
          <button
            className="navbar-btn navbar-btn--logout"
            onClick={handleLogout}
          >
            התנתקות
          </button>
        </div>
      </nav>

      {alert && (
        <div
          className={`emergency-banner ${isCritical ? "banner-critical" : "banner-minor"}`}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 99,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 1.5rem",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <span>{isCritical ? "🚨" : "⚠️"}</span>
          <span style={{ flex: 1 }}>
            {isCritical ? "חירום קריטי" : "חירום מינורי"}: {alert.description}
          </span>

          {/* כפתור להשתקת הסירנה בלבד בלי לסגור את ההתרעה מהמסך */}
          {!isMuted && (
            <button
              onClick={() => setIsMuted(true)}
              style={{
                backgroundColor: "#fff",
                color: "#333",
                border: "1px solid #ccc",
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🔕 השתק אזעקה
            </button>
          )}

          <button
            onClick={() => {
              stopAlertSound();
              navigate(`/trips/${tripDayOfTrip}/emergency`);
            }}
          >
            צפה בפרטים
          </button>
          <button
            onClick={() => {
              stopAlertSound();
              setAlert(null);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
