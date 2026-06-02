import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import UserDetails from "../components/UserDetails.jsx";
import "./trips/TripsPage.css";

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("current-user")) || {};

  useEffect(() => {
    if (user.role !== "principal") {
      navigate("/");
    }
  }, [user.role, navigate]);

  function handleUserSubmit(formData) {
    console.log("הוספת משתמש חדש:", formData);
    alert("טופס הוספת משתמש נשלח. יש לממש ב-API כדי לשמור באופן ממשי.");
  }

  if (user.role !== "principal") {
    return (
      <>
        <Navbar />
        <main className="page-main">
          <h1 className="page-title">גישה נדחשה</h1>
          <p>אין לך גישה לעמוד זה.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">ניהול המשתמשים</h1>
        <p>הוסף משתמש חדש למערכת.</p>
        <div className="trips-cards">
          <div className="trip-card">
            <UserDetails onSubmit={handleUserSubmit} />
          </div>
        </div>
      </main>
    </>
  );
}
