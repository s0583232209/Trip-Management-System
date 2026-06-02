import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import api from "../api";
import "./trips/TripsPage.css";
import "./ProfilePage.css";

function Row({
  label,
  fieldKey,
  editing,
  draft,
  view,
  onDraftChange,
  type = "text",
}) {
  return (
    <div className="ip-row">
      <span className="ip-label">{label}</span>
      {editing ? (
        <input
          className="ip-input"
          type={type}
          value={draft[fieldKey] ?? ""}
          onChange={(e) => onDraftChange(fieldKey, e.target.value)}
        />
      ) : (
        <span className="ip-value">
          {view[fieldKey] !== "" && view[fieldKey] != null ? (
            view[fieldKey]
          ) : (
            <span className="ip-empty">—</span>
          )}
        </span>
      )}
    </div>
  );
}

function normalize(u) {
  return {
    fullName: u.full_name ?? u.fullName ?? "",
    nationalId: u.national_id ?? u.nationalId ?? "",
    userEmail: u.email ?? u.userEmail ?? "",
    userPhoneNumber: u.phone ?? u.userPhoneNumber ?? "",
  };
}

export default function ProfilePage() {
  const stored = JSON.parse(sessionStorage.getItem("current-user")) || "{}";
  const effectiveId = stored.userId;
  const noUser = !effectiveId;

  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(!noUser);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(noUser ? "לא נמצא משתמש פעיל." : null);

  const [credOpen, setCredOpen] = useState(false);
  const [cred, setCred] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [credError, setCredError] = useState(null);
  const [credSaving, setCredSaving] = useState(false);

  useEffect(() => {
    if (noUser) {
      return;
    }

    async function fetchUser() {
      try {
        const res = await api.get(`/api/users/${effectiveId}`);
        setView(normalize(res.data));
      } catch {
        setError("לא ניתן לטעון את הפרופיל.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [effectiveId, noUser]);

  function startEdit() {
    setDraft({ ...view });
    setEditing(true);
    setError(null);
  }

  async function saveProfile() {
    setSaving(true);
    setError(null);

    try {
      const res = await api.put(`/api/users/${effectiveId}`, draft);

      setView(normalize(res.data));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "לא ניתן לשמור שינויים.");
    } finally {
      setSaving(false);
    }
  }

  async function saveCredentials() {
    if (!cred.currentPassword) {
      setCredError("יש להזין סיסמה נוכחית.");
      return;
    }

    if (cred.newPassword && cred.newPassword !== cred.confirmPassword) {
      setCredError("הסיסמאות החדשות אינן תואמות.");
      return;
    }

    setCredSaving(true);
    setCredError(null);

    try {
      await api.post(`/api/users/${effectiveId}/change-password`, {
        currentPassword: cred.currentPassword,
        newPassword: cred.newPassword || undefined,
      });

      setCredOpen(false);

      setCred({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setCredError(err.response?.data?.message || "עדכון נכשל, נסה שנית.");
    } finally {
      setCredSaving(false);
    }
  }

  function handleDraftChange(key, value) {
    setDraft((d) => ({
      ...d,
      [key]: value,
    }));
  }

  if (loading || !view) {
    return (
      <>
        <Navbar />
        <main className="page-main">
          <h1 className="page-title">פרופיל</h1>
          <div className="ip-inline">{loading ? "טוען..." : error}</div>
        </main>
      </>
    );
  }

  const initials = (view.fullName || "?")[0].toUpperCase();

  return (
    <>
      <Navbar />

      <main className="page-main">
        <h1 className="page-title">פרופיל</h1>

        <div className="trips-cards">
          <div className="trip-card">
            <div className="ip-inline">
              <div className="ip-header">
                <div className="ip-header-left">
                  <div className="ip-avatar">{initials}</div>

                  <div>
                    <div className="ip-header-name">
                      {view.fullName || "משתמש"}
                    </div>

                    <div className="ip-header-email">{view.userEmail}</div>
                  </div>
                </div>
              </div>

              <div className="ip-body">
                <div className="ip-section">
                  <div className="ip-section-head">
                    <span className="ip-section-label">פרטים אישיים</span>

                    {!editing && (
                      <button className="ip-edit-btn" onClick={startEdit}>
                        עריכה
                      </button>
                    )}
                  </div>

                  <Row
                    label="שם מלא"
                    fieldKey="fullName"
                    editing={editing}
                    draft={draft}
                    view={view}
                    onDraftChange={handleDraftChange}
                  />

                  <Row
                    label="תעודת זהות"
                    fieldKey="nationalId"
                    editing={false}
                    draft={draft}
                    view={view}
                    onDraftChange={handleDraftChange}
                  />

                  <Row
                    label="דואר אלקטרוני"
                    fieldKey="userEmail"
                    editing={editing}
                    draft={draft}
                    view={view}
                    onDraftChange={handleDraftChange}
                    type="email"
                  />

                  <Row
                    label="טלפון"
                    fieldKey="userPhoneNumber"
                    editing={editing}
                    draft={draft}
                    view={view}
                    onDraftChange={handleDraftChange}
                  />

                  {editing && (
                    <div className="ip-action-row">
                      {error && <p className="ip-error">{error}</p>}

                      <div className="ip-btns">
                        <button
                          className="ip-btn-primary"
                          onClick={saveProfile}
                          disabled={saving}
                        >
                          {saving ? "שומר..." : "שמור שינויים"}
                        </button>

                        <button
                          className="ip-btn-ghost"
                          onClick={() => {
                            setEditing(false);
                            setError(null);
                          }}
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ip-divider" />

                <div className="ip-section">
                  <div className="ip-section-head">
                    <span className="ip-section-label">סיסמה</span>

                    {!credOpen && (
                      <button
                        className="ip-edit-btn"
                        onClick={() => setCredOpen(true)}
                      >
                        שינוי
                      </button>
                    )}
                  </div>

                  <div className="ip-row">
                    <span className="ip-label">סיסמה</span>
                    <span className="ip-value ip-dots">••••••••</span>
                  </div>

                  {credOpen && (
                    <div className="ip-cred-box">
                      <div className="ip-cred-field">
                        <label>סיסמה נוכחית *</label>
                        <input
                          type="password"
                          value={cred.currentPassword}
                          onChange={(e) =>
                            setCred((c) => ({
                              ...c,
                              currentPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="ip-cred-field">
                        <label>סיסמה חדשה</label>
                        <input
                          type="password"
                          value={cred.newPassword}
                          onChange={(e) =>
                            setCred((c) => ({
                              ...c,
                              newPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="ip-cred-field">
                        <label>אימות סיסמה חדשה</label>
                        <input
                          type="password"
                          value={cred.confirmPassword}
                          onChange={(e) =>
                            setCred((c) => ({
                              ...c,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="ip-action-row">
                        {credError && <p className="ip-error">{credError}</p>}
                        <div className="ip-btns">
                          <button
                            className="ip-btn-primary"
                            onClick={saveCredentials}
                            disabled={credSaving}
                          >
                            {credSaving ? "מעדכן..." : "עדכן סיסמה"}
                          </button>
                          <button
                            className="ip-btn-ghost"
                            onClick={() => {
                              setCredOpen(false);
                              setCredError(null);
                            }}
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
