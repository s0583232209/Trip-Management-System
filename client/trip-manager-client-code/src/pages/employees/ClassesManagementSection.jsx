import { useState, useEffect } from "react";
import api from "../../api.js";
import "../trips/TripForms.css";
import "./AddEmployeePage.css";

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
    <section className="form-section classes-section">
      <h2 className="form-section-title">ניהול כיתות</h2>

      <h3 className="classes-sub-title">הוסף כיתות חדשות</h3>
      <p className="form-section-hint">בחר שכבות, קבע כמות כיתות ושמות.</p>

      <form onSubmit={handleAddClasses}>
        <div className="grades-grid">
          {grades.map((g, i) => (
            <div key={g.grade} className={`grade-card${g.selected ? " grade-card--selected" : ""}`}>
              <label className="grade-checkbox-label">
                <input type="checkbox" checked={g.selected} onChange={() => toggleGrade(i)} />
                שכבה {g.label}
              </label>
              {g.selected && (
                <div className="grade-fields">
                  <label>מספר כיתות</label>
                  <input
                    type="number"
                    min="1"
                    value={g.classCount}
                    onChange={(e) => updateClassCount(i, e.target.value)}
                    className="grade-count-input"
                  />
                  <div className="class-names-list">
                    {g.classNames.map((name, j) => (
                      <div key={j} className="class-name-row">
                        <label>כיתה {j + 1}</label>
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
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {addError && <p className="add-employee-error">{addError}</p>}
        {addSuccess && <p className="add-employee-success">{addSuccess}</p>}

        <button type="submit" className="trip-form-btn trip-form-btn--primary" disabled={saving}>
          {saving ? "שומר..." : "הוסף כיתות"}
        </button>
      </form>

      {classes.length > 0 && (
        <div className="classes-tags">
          {classes.map((c) => (
            <span key={c.id} className="class-tag">
              {c.class_name}
              <button
                type="button"
                onClick={() => handleDeleteClass(c)}
                aria-label={`מחיקת ${c.class_name}`}
                className="class-tag-delete"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {deleteError && <p className="add-employee-error">{deleteError}</p>}
    </section>
  );
}
