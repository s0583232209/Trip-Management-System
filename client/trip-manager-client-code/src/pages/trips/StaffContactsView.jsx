import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api.js";

const ROLE_LABELS = {
  principal: "מנהל",
  coordinator: "רכז טיולים",
  "trip leader": "אחראי טיול",
  teacher: "מורה",
};

const ROLE_ORDER = ["principal", "coordinator", "trip leader", "teacher"];

function ContactCard({ name, roles, phone, email }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "1rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.3rem",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
    }}>
      <span style={{ fontWeight: 700, fontSize: "1rem" }}>{name}</span>
      <span style={{ color: "#6366f1", fontSize: "0.85rem", fontWeight: 600 }}>{roles}</span>
      {phone && <span style={{ color: "#374151", fontSize: "0.9rem" }}>📞 {phone}</span>}
      {email && <span style={{ color: "#374151", fontSize: "0.9rem" }}>✉️ {email}</span>}
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

  useEffect(() => { fetchStaff(); }, [tripId]);

  // expose fetchStaff to parent via onRefresh ref pattern
  useEffect(() => {
    if (onRefresh) onRefresh.current = fetchStaff;
  }, []);

  const grouped = {};
  ROLE_ORDER.forEach((r) => (grouped[r] = []));
  (staff.employees ?? []).forEach((emp) => {
    const empRoles = (emp.roles ?? "").split(", ");
    const primaryRole = ROLE_ORDER.find((r) => empRoles.includes(r)) ?? "teacher";
    grouped[primaryRole].push(emp);
  });

  if (loading) return <p style={{ textAlign: "center" }}>טוען...</p>;

  return (
    <>
      {ROLE_ORDER.map((role) =>
        grouped[role].length === 0 ? null : (
          <section key={role} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.4rem" }}>
              {ROLE_LABELS[role]}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {grouped[role].map((emp) => (
                <ContactCard key={emp.id} name={emp.full_name} roles={emp.roles} phone={emp.phone} email={emp.email} />
              ))}
            </div>
          </section>
        )
      )}

      {(staff.externalEmployees ?? []).length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.4rem" }}>
            צוות חיצוני
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {staff.externalEmployees.map((emp) => (
              <ContactCard key={emp.id} name={emp.full_name ?? emp.role} roles={emp.role} phone={emp.phone} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
