import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import UserDetails from "../components/UserDetails.jsx";
import api from "../api.js";
import "./trips/TripsPage.css";
import "./AddEmployeePage.css";
import "./trips/TripForms.css";

const ROLE_LABELS = {
  principal: "מנהל",
  coordinator: "רכז טיולים",
  "trip leader": "אחראי טיול",
  teacher: "מורה",
};

const ASSIGNABLE_ROLES = ["coordinator", "trip leader", "teacher"];

function StaffManagementSection({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRoles, setPendingRoles] = useState({});
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  async function fetchUsers() {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data.filter((u) => u.user_id !== currentUserId));
    } catch (err) {
      setActionError(
        err.response?.data?.message || "טעינת רשימת הצוות נכשלה",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleDeleteUser(userId, fullName) {
    setActionError("");
    setActionSuccess("");
    if (
      !window.confirm(`האם למחוק את המשתמש "${fullName}"? פעולה זו אינה הפיכה.`)
    )
      return;
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      setActionSuccess(`המשתמש "${fullName}" נמחק בהצלחה`);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "מחיקת המשתמש נכשלה, נסה שנית",
      );
    }
  }

  function handleRoleSelect(userId, role) {
    setPendingRoles((prev) => ({ ...prev, [userId]: role }));
  }

  async function handleUpdateRole(userId, fullName) {
    setActionError("");
    setActionSuccess("");
    const role = pendingRoles[userId];
    if (!role) return;
    try {
      await api.put(`/api/users/${userId}/role`, { role });
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, roles: role } : u)),
      );
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setActionSuccess(`התפקיד עבור "${fullName}" עודכן בהצלחה`);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "עדכון התפקיד נכשל, נסה שנית",
      );
    }
  }

  if (loading) return <p style={{ textAlign: "center" }}>טוען...</p>;

  return (
    <section className="form-section" style={{ marginTop: "2rem" }}>
      <h2 className="form-section-title">ניהול צוות בית הספר</h2>

      {actionError && <p className="error form-submit-error">{actionError}</p>}
      {actionSuccess && (
        <p style={{ color: "green", fontWeight: "bold" }}>{actionSuccess}</p>
      )}

      {users.length === 0 ? (
        <p>אין משתמשים נוספים להצגה.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {users.map((u) => {
            const userRoles = (u.roles ?? "").split(", ").filter(Boolean);
            const currentRole = userRoles[0] ?? "";
            const isPrincipal = userRoles.includes("principal");
            const selectedRole = pendingRoles[u.user_id] ?? currentRole;

            return (
              <div
                key={u.user_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "0.85rem 1.1rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>
                    {u.full_name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6366f1",
                      fontWeight: 600,
                    }}
                  >
                    {ROLE_LABELS[currentRole] || currentRole || "ללא תפקיד"}
                  </div>
                  {u.email && (
                    <div style={{ fontSize: "0.85rem", color: "#374151" }}>
                      {u.email}
                    </div>
                  )}
                </div>

                {!isPrincipal && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <select
                      value={selectedRole}
                      onChange={(e) =>
                        handleRoleSelect(u.user_id, e.target.value)
                      }
                      style={{ padding: "0.5rem", borderRadius: "8px" }}
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="trip-form-btn trip-form-btn--primary"
                      disabled={
                        !pendingRoles[u.user_id] ||
                        pendingRoles[u.user_id] === currentRole
                      }
                      onClick={() => handleUpdateRole(u.user_id, u.full_name)}
                    >
                      שינוי תפקיד
                    </button>
                    <button
                      type="button"
                      className="trip-form-btn trip-form-btn--danger"
                      onClick={() => handleDeleteUser(u.user_id, u.full_name)}
                    >
                      מחיקה
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

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

        <StaffManagementSection currentUserId={user.userId} />
      </main>
    </>
  );
}
