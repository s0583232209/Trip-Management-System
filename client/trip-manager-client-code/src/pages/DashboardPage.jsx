import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "./DashboardPage.css";

const ACTIONS = {
  principal: [
    { label: "הוספת עובד", desc: "הוסף מורה, רכז או אחראי טיול", path: "/add-employee", color: "blue" },
    { label: "יצירת טיול", desc: "פתח טיול חדש ובחר מסלול", path: "/trips/new", color: "green" },
    { label: "ניהול טיולים", desc: "צפה, ערוך או מחק טיולים", path: "/trips", color: "brown" },
    { label: "העלאת קבצים", desc: "הוסף קבצים לתיק הטיול", path: "/trips", color: "blue" },
    { label: "אישור טיול סופי", desc: "אשר טיול לפני היציאה", path: "/trips", color: "green" },
    { label: "סגירת טיול", desc: "סגור טיול שהסתיים", path: "/trips", color: "brown" },
  ],
  coordinator: [
    { label: "יצירת טיול", desc: "פתח טיול חדש ובחר מסלול", path: "/trips/new", color: "green" },
    { label: "ניהול טיולים", desc: "צפה, ערוך או מחק טיולים", path: "/trips", color: "brown" },
    { label: "העלאת קבצים", desc: "הוסף קבצים לתיק הטיול", path: "/trips", color: "blue" },
    { label: "אישור טיול סופי", desc: "אשר טיול לפני היציאה", path: "/trips", color: "green" },
    { label: "סגירת טיול", desc: "סגור טיול שהסתיים", path: "/trips", color: "brown" },
  ],
  teacher: [
    { label: "צפייה בטיולים", desc: "צפה בפרטי הטיול והצוות", path: "/trips", color: "blue" },
    { label: "קריאת שמות", desc: "עדכן נוכחות תלמידים", path: "/trips/attendance", color: "green" },
    { label: "העלאת תיעוד", desc: "העלה תמונות, וידאו ואודיו", path: "/media", color: "brown" },
    { label: "חרום מינורי", desc: "פתח או סגור אירוע חרום", path: "/trips", color: "blue" },
  ],
  "trip-leader-before": [
    { label: "בחירת מסלול", desc: "בחר ועדכן את מסלול הטיול", path: "/trips", color: "green" },
    { label: "הכנסת מלווים", desc: "הוסף נתוני מלווים לטיול", path: "/trips", color: "blue" },
    { label: "העלאת קבצים", desc: "הוסף קבצים לתיק הטיול", path: "/trips", color: "brown" },
  ],
  "trip-leader-day": [
    { label: "קריאת שמות", desc: "עדכן נוכחות תלמידים", path: "/trips", color: "green" },
    { label: "עדכון מסלול", desc: "עדכן את המסלול בזמן אמת", path: "/trips", color: "blue" },
    { label: "חרום מלא", desc: "פתח אירוע חירום מלא", path: "/trips", color: "brown" },
    { label: "העלאת תיעוד", desc: "העלה תמונות, וידאו ואודיו", path: "/media", color: "blue" },
  ],
  parent: [
    { label: "צפייה בתכנים", desc: "צפה בתיעוד שהועלה", path: "/media", color: "blue" },
    { label: "אנשי קשר", desc: "צפה בפרטי הצוות המלווה", path: "/trips", color: "green" },
  ],
};

const ROLE_LABELS = {
  principal: "מנהל מוסד",
  coordinator: "רכז טיולים",
  teacher: "מורה",
  "trip-leader-before": "אחראי טיול (לפני)",
  "trip-leader-day": "אחראי טיול (ביום)",
  parent: "הורה",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("current-user"));

  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  const actions = ACTIONS[user?.role] || [];
  const pageActions = [
    ...actions,
    {
      label: "פרופיל",
      desc: "צפה במידע אישי ופרטי מערכת",
      path: "/profile",
      color: "blue",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">שלום, {ROLE_LABELS[user?.role] || user?.role}</h1>
          <p className="dashboard-sub">מה תרצה לעשות היום?</p>
        </div>
        <div className="dashboard-grid">
          {pageActions.map((action) => (
            <button
              key={action.label}
              className={`dashboard-card dashboard-card--${action.color}`}
              onClick={() => navigate(action.path)}
            >
              <span className="dashboard-card-label">{action.label}</span>
              <span className="dashboard-card-desc">{action.desc}</span>
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
