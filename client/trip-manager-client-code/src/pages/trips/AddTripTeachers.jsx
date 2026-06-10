import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import "./TripsPage.css";
import "./TripForms.css";

export default function AddTripTeachers() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  let i = 0;
  const [nationalIds, setNationalIds] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tripStaff, setTripStaff] = useState([]);
  const [schoolTeachers, setSchoolTeachers] = useState([]);
  useEffect(() => {
    async function getStaff() {
      const res = await api.get(`api/trips/${tripId}/staff`);
      console.log(res.data);
      const staff = res.data;
      setTripStaff(staff);
      console.log(tripStaff);
    }
    getStaff();
  }, []);
  useEffect(() => {
    async function getStaff() {
      const res = await api.get(`api/users`);
      console.log(res.data);
      const teachers = res.data;
      setSchoolTeachers(teachers);
    }
    getStaff();
  }, []);
  function updateField(index, value) {
    setNationalIds((prev) => prev.map((id, i) => (i === index ? value : id)));
  }

  function addField() {
    setNationalIds((prev) => [...prev, ""]);
  }

  function removeField(index) {
    setNationalIds((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const filled = nationalIds.filter((id) => id.trim() !== "");
    if (filled.length === 0) {
      setError("יש להזין לפחות מספר תעודת זהות אחד של מורה");
      return;
    }
    setLoading(true);
    try {
      // Directs payload to your educational staff endpoint
      await api.post(`/api/trips/${tripId}/staff`, { nationalIds: filled });
      setSuccess("מורים ומלווים חינוכיים שויכו לטיול בהצלחה!");
      setNationalIds([""]);
    } catch (err) {
      setError(
        err.response?.data?.message || "הוספת צוות המורים נכשלה, נסה שנית",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="page-main">
        <h1 className="page-title">שיבוץ צוות מורים ומלווים לטיול {tripId}</h1>
        <form className="trip-form" onSubmit={handleSubmit} noValidate>
          <section className="form-section">
            <h2 className="form-section-title">
              שיוך מורים ומחנכים מלווים (לפי ת.ז)
            </h2>
            <p className="form-section-hint">
              הזן את מספרי תעודות הזהות של המורים והרכזים המלווים את הטיול
              הנוכחי.
            </p>

            {nationalIds.map((id, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <select>
                  {console.log(tripStaff)}
                  {tripStaff.map((teacher) => (
                    <option
                      key={`${teacher.full_name}${i++}`}
                      value={teacher.id}
                    >
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
                {nationalIds.length > 1 && (
                  <button
                    type="button"
                    className="stop-remove-btn"
                    onClick={() => removeField(i)}
                  >
                    הסר
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="add-stop-btn"
              onClick={addField}
              disabled={loading}
            >
              + הוסף מורה מלווה
            </button>
          </section>

          {error && <p className="error form-submit-error">{error}</p>}
          {success && (
            <p
              style={{
                color: "green",
                fontWeight: "bold",
                textAlign: "right",
                marginTop: "1rem",
              }}
            >
              {success}
            </p>
          )}

          <div className="form-actions-row">
            <button
              type="button"
              className="trip-form-btn trip-form-btn--ghost"
              onClick={() => navigate(`/trips/${tripId}/planning`)}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="trip-form-btn trip-form-btn--primary"
              disabled={loading}
            >
              {loading ? "שומר..." : "שמור צוות חינוכי"}
            </button>
          </div>
        </form>
        <div>
          <h4>מורים שכבר יש לטיול</h4>
          <select>
            {console.log(schoolTeachers)}
            {schoolTeachers.map((teacher) => (
              <option key={`${teacher.full_name}${i++}`} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
        </div>
      </main>
    </>
  );
}
