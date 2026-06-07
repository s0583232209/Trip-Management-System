import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import UserDetails from "../components/UserDetails.jsx";
import api from "../api.js";
import "./trips/TripsPage.css";

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("current-user")) || {};

  useEffect(() => {
    if (user.role !== "principal") {
      navigate("/");
    }
  }, [user.role, navigate]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUserSubmit(formData) {
    setError("");
    setSuccess("");
    try {
      const principalRes = await api.get(`/api/users/${user.userId}`);
      const schoolId = principalRes.data.school_id;
      await api.post("/api/users", { ...formData, schoolId });
      setSuccess("המשתמש נוסף בהצלחה!");
    } catch (err) {
      setError(err.response?.data?.message || "הוספת המשתמש נכשלה, נסה שנית");
    }
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
        {error && <p className="errorLog">{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <div className="trips-cards">
          <div className="trip-card">
            <UserDetails onSubmit={handleUserSubmit} />
          </div>
        </div>
      </main>
    </>
  );
}
