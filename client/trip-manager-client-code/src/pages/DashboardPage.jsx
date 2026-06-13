import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar.jsx";
import "./DashboardPage.css";

const ROLE_LABELS = {
  principal: "מנהל מוסד",
  coordinator: "רכז טיולים",
  "trip leader": "אחראי טיול",
  teacher: "מורה",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const userRoles = user?.roles || (user?.role ? [user.role] : []);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const isPrincipal = userRoles.includes("principal");
  const isCoordinator = userRoles.includes("coordinator");
  const isManager = isPrincipal || isCoordinator;

  const roleLabel = userRoles
    .map((r) => ROLE_LABELS[r] || r)
    .join(" + ");

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">שלום, {roleLabel || "משתמש"}</h1>
          <p className="dashboard-sub">מה תרצה לעשות היום?</p>
        </div>
        <div className="dashboard-grid">
          <button
            className="dashboard-card dashboard-card--green"
            onClick={() => navigate("/trips")}
          >
            <span className="dashboard-card-label">טיולים</span>
            <span className="dashboard-card-desc">
              {isManager ? "צפה, צור ונהל טיולים" : "צפה בפרטי הטיולים שלך"}
            </span>
          </button>

          <button
            className="dashboard-card dashboard-card--blue"
            onClick={() => navigate("/profile")}
          >
            <span className="dashboard-card-label">פרופיל</span>
            <span className="dashboard-card-desc">עדכן פרטים אישיים וסיסמה</span>
          </button>

          {isPrincipal && (
            <button
              className="dashboard-card dashboard-card--purple"
              onClick={() => navigate("/add-employee")}
            >
              <span className="dashboard-card-label">ניהול משתמשים</span>
              <span className="dashboard-card-desc">הוסף וערוך אנשי צוות</span>
            </button>
          )}
        </div>
      </main>
    </>
  );
}
