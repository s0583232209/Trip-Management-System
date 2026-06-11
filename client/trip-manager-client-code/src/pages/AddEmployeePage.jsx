import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import UserDetails from "../components/UserDetails.jsx";
import api from "../api.js";
import "./trips/TripsPage.css";
import "./AddEmployeePage.css";

export default function AddEmployeePage() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("current-user")) || {};

  useEffect(() => {
    if (user.role !== "principal") {
      navigate("/");
    }
  }, [user.role, navigate]);

  const emptyForm = { fullName: "", nationalId: "", password: "", userEmail: "", userPhoneNumber: "", role: "" };
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleUserSubmit(formData) {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const principalRes = await api.get(`/api/users/${user.userId}`);
      const schoolId = principalRes.data.school_id;
      await api.post("/api/users", { ...formData, schoolId });
      setSuccess("המשתמש נוסף בהצלחה!");
      setFormKey((k) => k + 1);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "הוספת המשתמש נכשלה, נסה שנית");
    } finally {
      setLoading(false);
    }
  }

  if (user.role !== "principal") {
    return <Navigate to="/unauthorized" replace />;
  }

  const submitLabel = loading ? "מוסיף משתמש..." : "הוסף משתמש";

  return (
    <>
      <Navbar />
      <main className="page-main">
        <h1 className="page-title">ניהול המשתמשים</h1>
        <p>הוסף משתמש חדש למערכת.</p>
        <div className="trips-cards">
          <div className="trip-card">
            <UserDetails
              key={formKey}
              onSubmit={handleUserSubmit}
              hideRoleSelect={false}
              success={success}
              error={error}
              loading={loading}
              submitLabel={submitLabel}
            />
          </div>
        </div>
      </main>
    </>
  );
}
