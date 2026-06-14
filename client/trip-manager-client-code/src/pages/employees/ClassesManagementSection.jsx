import { useState, useEffect } from "react";
import api from "../../api.js";

const GRADE_LABELS = ["א'","ב'","ג'","ד'","ה'","ו'","ז'","ח'","ט'","י'","י\"א","י\"ב"];

const emptyGrades = () =>
  GRADE_LABELS.map((label, i) => ({
    grade: i + 1,
    label,
    selected: false,
    classCount: 1,
    classNames: [`${label}-1`],
  }));

export default function ClassesManagementSection() {
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState(emptyGrades());
  const [addErrors, setAddErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data);
    } catch {
      // ignore
    }
  }

  async function handleDeleteClass(c) {
    if (!window.confirm(`האם למחוק את הכיתה "${c.class_name}"? פעולה זו אינה הפיכה.`))
      return;
    setDeleteError("");
    try {
      await api.delete(`/api/classes/${c.id}`);
      setClasses((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      setDeleteError(err.response?.data?.message || "מחיקת הכיתה נכשלה");
    }
  }

  function toggleGrade(index) {
    setGrades((prev) =>
      prev.map((g, i) => (i === index ? { ...g, selected: !g.selected } : g)),
    );
  }

  function updateClassCount(index, value) {
    const count = Math.max(1, Number(value) || 1);
    setGrades((prev) =>
      prev.map((g, i) => {
        if (i !== index) return g;
        const classNames = Array.from(
          { length: count },
          (_, j) => g.classNames[j] || `${g.label}-${j + 1}`,
        );
        return { ...g, classCount: count, classNames };
      }),
    );
  }

  function updateClassName(gradeIndex, classIndex, value) {
    setGrades((prev) =>
      prev.map((g, i) => {
        if (i !== gradeIndex) return g;
        const classNames = g.classNames.map((n, j) =>
          j === classIndex ? value : n,
        );
        return { ...g, classNames };
      }),
    );
  }

  async function handleAddClasses(e) {
    e.preventDefault();
    const newErrors = {};
    grades
      .filter((g) => g.selected)
      .forEach((g) => {
        g.classNames.forEach((name, j) => {
          if (!name.trim())
            newErrors[`grade_${g.grade}_class_${j}`] =
              `יש להזין שם לכיתה ${j + 1} בשכבה ${g.label}`;
        });
      });
    setAddErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const selected = grades.filter((g) => g.selected);
    if (selected.length === 0) {
      setAddError("יש לבחור לפחות שכבה אחת");
      return;
    }

    setSaving(true);
    setAddError("");
    setAddSuccess("");
    try {
      await Promise.all(
        selected.flatMap((g) =>
          g.classNames.map((name) =>
            api.post("/api/classes", { className: name.trim(), grade: g.grade }),
          ),
        ),
      );
      await fetchClasses();
      setGrades(emptyGrades());
      setAddSuccess("הכיתות נוספו בהצלחה ✓");
      setTimeout(() => setAddSuccess(""), 3000);
    } catch (err) {
      setAddError(err.response?.data?.message || "שמירת הכיתות נכשלה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-section" style={{ marginTop: "2rem" }}>
      <h2 className="form-section-title">ניהול כיתות</h2>

      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        הוסף כיתות חדשות
      </h3>
      <p className="form-section-hint">בחר שכבות, קבע כמות כיתות ושמות.</p>
      <form onSubmit={handleAddClasses}>
        {grades.map((g, i) => (
          <div key={g.grade} className="stop-card">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" checked={g.selected} onChange={() => toggleGrade(i)} />
              שכבה {g.label}
            </label>
            {g.selected && (
              <>
                <label>מספר כיתות בשכבה</label>
                <input
                  type="number"
                  min="1"
                  value={g.classCount}
                  onChange={(e) => updateClassCount(i, e.target.value)}
                />
                {g.classNames.map((name, j) => (
                  <div key={j}>
                    <label>שם כיתה {j + 1}</label>
                    <input
                      type="text"
                      value={name}
                      placeholder={`${g.label}-${j + 1}`}
                      onChange={(e) => updateClassName(i, j, e.target.value)}
                    />
                    {addErrors[`grade_${g.grade}_class_${j}`] && (
                      <p className="error">{addErrors[`grade_${g.grade}_class_${j}`]}</p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
        {addError && <p className="error">{addError}</p>}
        {addSuccess && <p style={{ color: "green", fontWeight: "bold" }}>{addSuccess}</p>}
        <button type="submit" className="trip-form-btn trip-form-btn--primary" disabled={saving}>
          {saving ? "שומר..." : "הוסף כיתות"}
        </button>
      </form>

      {classes.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.5rem" }}>
          {classes.map((c) => (
            <span
              key={c.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.5rem 0.35rem 0.75rem",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 6,
                fontSize: "0.88rem",
              }}
            >
              {c.class_name}
              <button
                type="button"
                onClick={() => handleDeleteClass(c)}
                aria-label={`מחיקת ${c.class_name}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "1rem",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {deleteError && <p className="error" style={{ marginTop: "0.5rem" }}>{deleteError}</p>}
    </section>
  );
}
