import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "./DashboardPage.css";

const ACTIONS = {
  principal: [
    { label: "טיולים", desc: "צפה, צור ונהל טיולים", path: "/trips", color: "green" },
    { label: "הוספת עובד", desc: "הוסף מורה, רכז או אחראי טיול", path: "/add-employee", color: "blue" },
    { label: "מדיה", desc: "צפה בתיעוד הטיולים", path: "/media", color: "brown" },
  ],
  coordinator: [
    { label: "טיולים", desc: "צור, ערוך ואשר טיולים", path: "/trips", color: "green" },
    { label: "מדיה", desc: "צפה בתיעוד הטיולים", path: "/media", color: "brown" },
  ],
  "trip leader": [
    { label: "הטיול שלי", desc: "נהל את הטיול — מסלול, צוות ויום הטיול", path: "/trips", color: "green" },
    { label: "מדיה", desc: "העלה תיעוד מהטיול", path: "/media", color: "brown" },
  ],
  teacher: [
    { label: "הטיול שלי", desc: "צפה בפרטי הטיול וביום הטיול", path: "/trips", color: "green" },
    { label: "מדיה", desc: "העלה תיעוד מהטיול", path: "/media", color: "brown" },
  ],
};

const ROLE_LABELS = {
  principal: "מנהל מוסד",
  coordinator: "רכז טיולים",
  "trip leader": "אחראי טיול",
  teacher: "מורה",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("current-user"));

  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  const actions = ACTIONS[user?.role] || [];

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">שלום, {ROLE_LABELS[user?.role] || user?.role}</h1>
          <p className="dashboard-sub">מה תרצה לעשות היום?</p>
        </div>
        <div className="dashboard-grid">
          {actions.map((action) => (
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
