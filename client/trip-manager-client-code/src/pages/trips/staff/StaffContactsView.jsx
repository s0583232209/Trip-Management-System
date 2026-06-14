import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api.js";
import { canManageTrip } from "../../../permissions.js";
import "../TripForms.css";

const ROLE_LABELS = {
  principal: "מנהל",
  coordinator: "רכז טיולים",
  "trip leader": "אחראי טיול",
  teacher: "מורה",
};
const ROLE_ORDER = ["principal", "coordinator", "trip leader", "teacher"];

const EXTERNAL_ROLE_LABELS = {
  guard: "מאבטח חמוש",
  medic: "חובש מלווה",
  paramedic: "פראמדיק / רופא",
  firstAidProvider: 'מע"ר',
  "first-aid-provider": 'מע"ר',
  guide:"מדריך טיולים",
};

function ContactCard({ name, roles, className, phone, email, isTripLeader, onDelete }) {
  return (
    <div className={`contact-card${isTripLeader ? " contact-card--leader" : ""}`}>
      <span className="contact-card-name">
        {isTripLeader && <span className="contact-card-leader-badge">אחראי הטיול</span>}
        {name}
      </span>
      <span className="contact-card-role">{roles}</span>
      {className && (
        <span className="contact-card-class">
          כיתה: <strong>{className}</strong>
        </span>
      )}
      {phone && (
        <a href={`tel:${phone}`} className="contact-card-link">
          📞 {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="contact-card-link">
          ✉️ {email}
        </a>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="trip-form-btn trip-form-btn--danger contact-card-delete"
        >
          הסר מהטיול
        </button>
      )}
    </div>
  );
}

export default function StaffContactsView({ onRefresh, readOnly = false }) {
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

  async function handleDeleteStaff(staffId) {
    if (!window.confirm("האם להסיר את איש הצוות מהטיול?")) return;
    try {
      await api.delete(`/api/trips/${tripId}/staff/${staffId}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "הסרת איש הצוות נכשלה, נסה שנית");
    }
  }

  async function handleDeleteExternalStaff(staffId) {
    if (!window.confirm("האם להסיר את איש הצוות החיצוני מהטיול?")) return;
    try {
      await api.delete(`/api/trips/${tripId}/external-staff/${staffId}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || "הסרת איש הצוות החיצוני נכשלה, נסה שנית");
    }
  }

  const grouped = {};
  ROLE_ORDER.forEach((r) => (grouped[r] = []));

  (staff.employees ?? []).forEach((emp) => {
    const empRoles = (emp.roles ?? "").split(", ");
    const primaryRole = ROLE_ORDER.find((r) => empRoles.includes(r)) ?? "teacher";
    const effectiveRole = emp.is_trip_leader ? "trip leader" : primaryRole;
    grouped[effectiveRole].push({ ...emp, displayRoles: empRoles.map((r) => ROLE_LABELS[r] ?? r).join(", ") });
  });

  const hasAny = ROLE_ORDER.some((r) => grouped[r].length > 0) || (staff.externalEmployees ?? []).length > 0;

  return (
    <>
      {!hasAny && (
        <p className="staff-empty">אין אנשי צוות משובצים לטיול זה עדיין.</p>
      )}

      {ROLE_ORDER.map((role) =>
        grouped[role].length === 0 ? null : (
          <section key={role} className="staff-section">
            <h2 className="staff-section-title">
              {ROLE_LABELS[role]}
            </h2>
            <div className="staff-section-grid">
              {grouped[role].map((emp) => (
                <ContactCard
                  key={emp.id}
                  name={emp.full_name}
                  roles={emp.displayRoles}
                  className={emp.class_name}
                  phone={emp.phone}
                  email={emp.email}
                  isTripLeader={!!emp.is_trip_leader}
                  onDelete={!readOnly && canManageTrip() ? () => handleDeleteStaff(emp.id) : undefined}
                />
              ))}
            </div>
          </section>
        )
      )}

      {(staff.externalEmployees ?? []).length > 0 && (
        <section className="staff-section">
          <h2 className="staff-section-title">
            צוות חיצוני
          </h2>
          <div className="staff-section-grid">
            {staff.externalEmployees.map((emp) => (
              <ContactCard
                key={emp.id}
                name={emp.full_name ?? "—"}
                roles={EXTERNAL_ROLE_LABELS[emp.role] ?? emp.role}
                phone={emp.phone}
                onDelete={!readOnly && canManageTrip() ? () => handleDeleteExternalStaff(emp.id) : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
