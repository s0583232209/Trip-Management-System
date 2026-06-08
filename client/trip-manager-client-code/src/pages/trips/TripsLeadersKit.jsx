import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import api from "../../api.js";
import "./TripsPage.css";
import "./TripForms.css";

// סוגי מלווים ונותני שירות זמינים לבחירה
const REQUIRED_STAFF_TYPES = [
  { value: "guard", label: "מאבטח חמוש" },
  { value: "medic", label: "חובש מלווה" },
  { value: "paramedic", label: "פראמדיק / רופא" },
  { value: "guard-medic", label: "מאבטח שהוא גם חובש" },
  { value: "driver", label: "נהג אוטובוס" },
  { value: "tour_guide", label: "מורה דרך / מדריך מקומי" },
  { value: "other", label: "אחר" },
];

export default function TripsLeadersKit() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. מסמכי חובה רשמיים מתוך אוגדן הטיולים של משרד החינוך
  const [officialDocs, setOfficialDocs] = useState({
    appointmentLetter: {
      file: null,
      label: "נספח ב' - כתב מינוי לאחראי/ת טיול בחתימת המנהל/ת",
    },
    principalApproval: {
      file: null,
      label: "נספח ג' - אישור מנהל/ת ביה\"ס ליציאה לטיול",
    },
    securityApproval: {
      file: null,
      label: "אישור ביטחוני מהלשכה לתיאום טיולים (חדר מצב)",
    },
    exceptionalActivity: {
      file: null,
      label: "נספח ד' - אישור מנהל/ת ביה\"ס לפעילות חריגה בטיול (אם יש)",
    },
    parentApprovals: {
      file: null,
      label: "נספח ה' - ריכוז אישורי הורים על השתתפות בנם/בתם",
    },
    studentListThreeCopies: {
      file: null,
      label: "רשימת תלמידים משתתפים (עותק לאחראי, אוטובוס ומזכירות)",
    },
    medicalRestrictions: {
      file: null,
      label: "נספח ו' - רשימת תלמידים עם מגבלות רפואיות",
    },
    medicalReferralForm: {
      file: null,
      label: "נספח ז' - טופס הפניה לטיפול רפואי לתלמיד שנפגע",
    },
    injuredStudentList: {
      file: null,
      label: "נספח ח' - רשימת תלמידים שנפגעו במהלך טיול",
    },
    volunteerInsurance: {
      file: null,
      label: "נספח ט' - טופס ביטוח למתנדב / הורה מלווה",
    },
    emergencyContacts: {
      file: null,
      label: "נספח י' - רשימת מלווים וטלפונים חיוניים בטיול",
    },
    firingInstructions: {
      file: null,
      label: 'נספח י"א - הוראות פתיחה באש למאבטחים',
    },
    busTeacherInstructions: {
      file: null,
      label: 'נספח י"ב - הנחיות למורה אחראי/ת באוטובוס',
    },
    classTeacherInstructions: {
      file: null,
      label: 'נספח י"ג - הנחיות למורה אחראי/ת כיתה',
    },
    weatherUpdate: { file: null, label: "עדכון מזג אויר והתאמתו לטיול" },
    phoneCoordination: {
      file: null,
      label: "אישור ביצוע תיאום טלפוני כנדרש באישור הטיול",
    },
    areaMap: {
      file: null,
      label: "המצאות מפת אזור הטיול כולל מפת סימון שבילים בתוקף",
    },
    preliminaryTour: {
      file: null,
      label: 'אישור ביצוע סיור הכנה מקדים ע"י אחראי הטיול',
    },
  });

  // 2. מלווים ונותני שירות חיצוניים (מאבטחים, חובשים וכו') ומסמכי ההסמכה שלהם
  const [externalStaffRequirements, setExternalStaffRequirements] = useState([
    {
      role: "guard",
      count: 1,
      file: null,
      fileDescription: "רישיון נשק / תעודת בתוקף",
    },
  ]);

  // 3. מסמכים כלליים נוספים שהמשתמש יכול להוסיף באופן חופשי
  const [additionalFiles, setAdditionalFiles] = useState([]);

  // // שליפת נתונים קיימים במידה והתיק כבר עודכן בעבר
  // useEffect(() => {
  //   async function fetchPortfolio() {
  //     if (!tripId) return;
  //     try {
  //       setFetching(true);
  //       const res = await api
  //         .get(`/api/trips/${tripId}/portfolio`)
  //         .catch(() => null);
  //       if (res && res.data) {
  //         // כאן ניתן לבצע סינכרון עם רכיבי ה-state במידה והשרת מחזיר מידע קיים
  //       }
  //     } catch (err) {
  //       console.error("Failed to load portfolio data", err);
  //     } finally {
  //       setFetching(false);
  //     }
  //   }
  //   fetchPortfolio();
  // }, [tripId]);

  // עדכון קובץ חובה של האוגדן
  function handleOfficialFileChange(key, file) {
    setOfficialDocs((prev) => ({
      ...prev,
      [key]: { ...prev[key], file },
    }));
  }

  // --- ניהול דינמי של מלווים חיצוניים ---
  function handleAddStaffRequirement() {
    setExternalStaffRequirements((prev) => [
      ...prev,
      { role: "guard", count: 1, file: null, fileDescription: "" },
    ]);
  }

  function handleRemoveStaffRequirement(index) {
    setExternalStaffRequirements((prev) => prev.filter((_, i) => i !== index));
  }

  function handleStaffReqChange(index, field, value) {
    setExternalStaffRequirements((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  // --- ניהול דינמי של מסמכים כלליים אקסטרה ---
  function handleAddAdditionalFile() {
    setAdditionalFiles((prev) => [...prev, { file: null, description: "" }]);
  }

  function handleRemoveAdditionalFile(index) {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdditionalFileChange(index, field, value) {
    setAdditionalFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  // --- שליחת הטופס המאוחד לשרת ---
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("tripId", tripId);

      // 1. הזרקת קבצי אוגדן הטיולים הרשמיים
      Object.keys(officialDocs).forEach((key) => {
        if (officialDocs[key].file) {
          formData.append(`official_${key}`, officialDocs[key].file);
        }
      });

      // 2. הזרקת דרישות המלווים הדינמיים והקבצים שלהם
      const staffRequirementsPayload = externalStaffRequirements.map(
        (item, index) => {
          if (item.file) {
            formData.append(`staff_file_${index}`, item.file);
          }
          return {
            role: item.role,
            count: item.count,
            fileDescription: item.fileDescription,
            hasFile: !!item.file,
          };
        },
      );
      formData.append(
        "staffRequirements",
        JSON.stringify(staffRequirementsPayload),
      );

      // 3. הזרקת מסמכים נוספים חופשיים
      let extraCount = 0;
      additionalFiles.forEach((item) => {
        if (item.file) {
          formData.append("additionalFiles", item.file);
          formData.append(
            `additionalDescription_${extraCount}`,
            item.description,
          );
          extraCount++;
        }
      });

      // שליחה ב-Multipart לשרת
      await api.post(`/api/trips/${tripId}/portfolio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("אוגדן הטיול, דרישות המלווים והמסמכים נשמרו ועודכנו בהצלחה!");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "שמירת תיק אוגדן הטיול נכשלה. נסה שנית.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <>
        <Navbar />
        <main
          className="page-main"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <h2>טוען את נתוני אוגדן הטיול...</h2>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main
        className="page-main"
        style={{ maxWidth: "950px", margin: "0 auto", padding: "2rem" }}
      >
        <h1 className="page-title">
          בניית אוגדן ותיק טיול משולב — טיול {tripId}
        </h1>

        <form className="trip-form" onSubmit={handleSubmit} noValidate>
          {/* סקשן 1: דרישות מלווים ונותני שירות (מאבטחים וחובשים) */}
          <section className="form-section">
            <h2 className="form-section-title">
              1. דרישות מלווים ומסמכי הסמכה חיצוניים
            </h2>
            <p className="form-section-hint">
              הגדר כמה מאבטחים, חובשים או נהגים נדרשים לטיול זה, וצרף עבורם את
              אישורי ההסמכה המתאימים (רשיונות נשק, תעודות חובש).
            </p>

            {externalStaffRequirements.map((item, index) => (
              <div
                key={index}
                className="stop-card"
                style={{ padding: "1.25rem", marginBottom: "1.25rem" }}
              >
                <div
                  className="stop-card-header"
                  style={{ marginBottom: "1rem" }}
                >
                  <span className="stop-index">דרישת מלווה {index + 1}</span>
                  {externalStaffRequirements.length > 1 && (
                    <button
                      type="button"
                      className="stop-remove-btn"
                      onClick={() => handleRemoveStaffRequirement(index)}
                    >
                      הסר דרישה
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <label>תפקיד המלווה / נותן השירות חיצוני</label>
                    <select
                      value={item.role}
                      onChange={(e) =>
                        handleStaffReqChange(index, "role", e.target.value)
                      }
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                      }}
                    >
                      {REQUIRED_STAFF_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>כמות נדרשת</label>
                    <input
                      type="number"
                      min="1"
                      value={item.count}
                      onChange={(e) =>
                        handleStaffReqChange(
                          index,
                          "count",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px dashed #ddd",
                    paddingTop: "1rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label>צרף קובץ הסמכה / אישור (אופציונלי)</label>
                      <input
                        type="file"
                        onChange={(e) =>
                          handleStaffReqChange(index, "file", e.target.files[0])
                        }
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label>תיאור המסמך המצורף</label>
                      <input
                        type="text"
                        placeholder="לדוגמה: רישיון נשק ארגוני בתוקף"
                        value={item.fileDescription}
                        onChange={(e) =>
                          handleStaffReqChange(
                            index,
                            "fileDescription",
                            e.target.value,
                          )
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-stop-btn"
              onClick={handleAddStaffRequirement}
              disabled={loading}
            >
              + הגדר דרישת מלווה / איש צוות נוסף
            </button>
          </section>

          {/* סקשן 2: אוגדן טיולים - חלק א': אישורים ביטחוניים וניהוליים */}
          <section className="form-section">
            <h2 className="form-section-title">
              2. אוגדן טיולים — אישורים ביטחוניים וניהוליים
            </h2>
            <p className="form-section-hint">
              העלה את אישורי ההנהלה ואישורי חדר המצב הנדרשים ביציאה.
            </p>

            <div className="stop-card" style={{ padding: "1.25rem" }}>
              <label>{officialDocs.appointmentLetter.label} *</label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "appointmentLetter",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.principalApproval.label} *
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "principalApproval",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.securityApproval.label} *
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "securityApproval",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.exceptionalActivity.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "exceptionalActivity",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.preliminaryTour.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange("preliminaryTour", e.target.files[0])
                }
                disabled={loading}
              />
            </div>
          </section>

          {/* סקשן 3: אוגדן טיולים - חלק ב': רשימות כיתה ונספחים רפואיים */}
          <section className="form-section">
            <h2 className="form-section-title">
              3. אוגדן טיולים — רשימות תלמידים ורפואה
            </h2>
            <p className="form-section-hint">
              ריכוז טפסי הורים, חלוקת עותקים ומעקב רפואי בשטח בשעת הצורך.
            </p>

            <div className="stop-card" style={{ padding: "1.25rem" }}>
              <label>{officialDocs.parentApprovals.label} *</label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange("parentApprovals", e.target.files[0])
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.studentListThreeCopies.label} *
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "studentListThreeCopies",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.medicalRestrictions.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "medicalRestrictions",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.medicalReferralForm.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "medicalReferralForm",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.injuredStudentList.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "injuredStudentList",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />
            </div>
          </section>

          {/* סקשן 4: אוגדן טיולים - חלק ג': נהלים, שטח ולוגיסטיקה */}
          <section className="form-section">
            <h2 className="form-section-title">
              4. אוגדן טיולים — נהלים, מפות והתאמת שטח
            </h2>
            <p className="form-section-hint">
              הנחיות לצוותי ההוראה, מפות מעודכנות וביטוחי מתנדבים.
            </p>

            <div className="stop-card" style={{ padding: "1.25rem" }}>
              <label>{officialDocs.volunteerInsurance.label}</label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "volunteerInsurance",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.emergencyContacts.label} *
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "emergencyContacts",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.firingInstructions.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "firingInstructions",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.busTeacherInstructions.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "busTeacherInstructions",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.classTeacherInstructions.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "classTeacherInstructions",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.weatherUpdate.label} *
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange("weatherUpdate", e.target.files[0])
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.phoneCoordination.label}
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange(
                    "phoneCoordination",
                    e.target.files[0],
                  )
                }
                disabled={loading}
              />

              <label style={{ marginTop: "1rem" }}>
                {officialDocs.areaMap.label} *
              </label>
              <input
                type="file"
                onChange={(e) =>
                  handleOfficialFileChange("areaMap", e.target.files[0])
                }
                disabled={loading}
              />
            </div>
          </section>

          {/* סקשן 5: מסמכים חופשיים נוספים ללא הגבלה */}
          <section className="form-section">
            <h2 className="form-section-title">
              5. קבצים ומסמכים נוספים בהתאמה אישית
            </h2>
            <p className="form-section-hint">
              אם ישנם קבצים נוספים שברצונך לצרף לתיק הטיול שאינם מופיעים למעלה.
            </p>

            {additionalFiles.map((item, index) => (
              <div
                key={index}
                className="stop-card"
                style={{ padding: "1.25rem", marginBottom: "1rem" }}
              >
                <div
                  className="stop-card-header"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <span className="stop-index">קובץ נוסף {index + 1}</span>
                  <button
                    type="button"
                    className="stop-remove-btn"
                    onClick={() => handleRemoveAdditionalFile(index)}
                  >
                    הסר
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    alignItems: "end",
                  }}
                >
                  <div>
                    <label>בחר קובץ</label>
                    <input
                      type="file"
                      onChange={(e) =>
                        handleAdditionalFileChange(
                          index,
                          "file",
                          e.target.files[0],
                        )
                      }
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label>כותרת / תיאור הקובץ</label>
                    <input
                      type="text"
                      placeholder="לדוגמה: תצלום אישור הסעה מיוחד"
                      value={item.description}
                      onChange={(e) =>
                        handleAdditionalFileChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="add-stop-btn"
              onClick={handleAddAdditionalFile}
              disabled={loading}
            >
              + הוסף מסמך חופשי נוסף לתיק הטיול
            </button>
          </section>

          {/* שורת שגיאות והצלחות */}
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

          {/* כפתורי פעולה */}
          <div className="form-actions-row">
            <button
              type="button"
              className="trip-form-btn trip-form-btn--ghost"
              onClick={() => navigate(`/trips/${tripId}`)}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="trip-form-btn trip-form-btn--primary"
              disabled={loading}
            >
              {loading ? "שומר תיק טיול..." : "שמור אוגדן ונותני שירות"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
