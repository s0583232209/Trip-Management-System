import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api.js";
import "./TripForms.css";

const ROLE_LABELS = {
  principal: "מנהל",
  "trip leader": "אחראי טיול",
  teacher: "מורה",
};
const ROLE_ORDER = ["principal", "trip leader", "teacher"];

function ContactCard({ name, roles, phone, email }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "1rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.4rem",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    }}>
      <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>{name}</span>
      <span style={{ color: "#6366f1", fontSize: "0.82rem", fontWeight: 600 }}>{roles}</span>
      {phone && (
        <a href={`tel:${phone}`} style={{ color: "#374151", fontSize: "0.9rem", textDecoration: "none" }}>
          📞 {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} style={{ color: "#374151", fontSize: "0.9rem", textDecoration: "none" }}>
          ✉️ {email}
        </a>
      )}
    </div>
  );
}

export default function StaffContactsView({ onRefresh }) {
  const { tripId } = useParams();
  const [staff, setStaff] = useState({ employees: [], externalEmployees: [] });
  const [loading, setLoading] = useState(true);

  async function fetchStaff() {
    try {
      const res = await api.get(`/api/trips/${tripId}/staff`);
      setStaff(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStaff();
    if (onRefresh) onRefresh.current = fetchStaff;
  }, [tripId]);

  // Group by role — coordinator is excluded (not present on trip day)
  const grouped = {};
  ROLE_ORDER.forEach((r) => (grouped[r] = []));

  (staff.employees ?? []).forEach((emp) => {
    const empRoles = (emp.roles ?? "").split(", ").filter((r) => r !== "coordinator");
    if (empRoles.length === 0) return; // skip pure coordinators
    const primaryRole = ROLE_ORDER.find((r) => empRoles.includes(r)) ?? "teacher";
    grouped[primaryRole].push({ ...emp, displayRoles: empRoles.map((r) => ROLE_LABELS[r] ?? r).join(", ") });
  });

  if (loading) return <p style={{ textAlign: "center" }}>טוען...</p>;

  const hasAny = ROLE_ORDER.some((r) => grouped[r].length > 0) || (staff.externalEmployees ?? []).length > 0;

  return (
    <>
      {!hasAny && (
        <p style={{ textAlign: "center", color: "#888", padding: "2rem 0" }}>אין אנשי צוות משובצים לטיול זה עדיין.</p>
      )}

      {ROLE_ORDER.map((role) =>
        grouped[role].length === 0 ? null : (
          <section key={role} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.4rem", color: "#1e293b" }}>
              {ROLE_LABELS[role]}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
              {grouped[role].map((emp) => (
                <ContactCard key={emp.id} name={emp.full_name} roles={emp.displayRoles} phone={emp.phone} email={emp.email} />
              ))}
            </div>
          </section>
        )
      )}

      {(staff.externalEmployees ?? []).length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.4rem", color: "#1e293b" }}>
            צוות חיצוני
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
            {staff.externalEmployees.map((emp) => (
              <ContactCard key={emp.id} name={emp.full_name ?? "—"} roles={emp.role} phone={emp.phone} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
