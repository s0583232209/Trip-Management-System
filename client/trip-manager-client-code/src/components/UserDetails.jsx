import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./UserDetails.css";

const defaultUserDetails = {
  fullName: "",
  nationalId: "",
  password: "",
  userEmail: "",
  userPhoneNumber: "",
  role: "",
};

export default function UserDetails({
  onSubmit,
  onBack,
  hideRoleSelect,
  initialData,
  success,
  error,
  loading,
  submitLabel,
}) {
  const location = useLocation();
  const isAuth = location.pathname.includes("auth");

  const [formData, setFormData] = useState(initialData || defaultUserDetails);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  function updateField(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  const nameRegex = /^[\p{L}\d\s]{2,}$/u;
  const nationalIdRegex = /^\d{9}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[\p{L}])[\p{L}\d\S]{6,}$/u;
  const phoneRegex = /^\+?[\d\s-]{7,15}$/;

  function handleBack() {
    if (onBack) {
      onBack(formData);
    }
  }

  function submitForm(event) {
    event.preventDefault();

    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "נא למלא שם פרטי ומשפחה";
    } else if (!nameRegex.test(formData.fullName)) {
      newErrors.fullName = "שם חייב להכיל לפחות 2 אותיות";
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = "נא למלא מספר תעודת זהות";
    } else if (!nationalIdRegex.test(formData.nationalId)) {
      newErrors.nationalId = "מספר תעודת זהות חייב להכיל 9 ספרות בדיוק";
    }

    if (isAuth && !formData.password.trim()) {
      newErrors.password = "נא למלא סיסמה";
    } else if (isAuth && !passwordRegex.test(formData.password)) {
      newErrors.password =
        "הסיסמה חייבת להכיל לפחות 6 תווים, אות אחת ומספר אחד";
    }

    if (
      formData.userEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)
    ) {
      newErrors.userEmail = "כתובת דואר אלקטרוני לא תקינה";
    }

    if (
      formData.userPhoneNumber &&
      !phoneRegex.test(formData.userPhoneNumber)
    ) {
      newErrors.userPhoneNumber = "מספר טלפון לא תקין";
    }

    if (!isAuth && !hideRoleSelect && !formData.role) {
      newErrors.role = "נא לבחור תפקיד";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  }

  return (
    <form onSubmit={submitForm}>
      <label htmlFor="fullName">שם פרטי ומשפחה</label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        autoComplete="name"
        placeholder="*"
        value={formData.fullName}
        onChange={updateField}
      />
      {errors.fullName && <p className="error">{errors.fullName}</p>}

      <label htmlFor="nationalId">מספר תעודת זהות</label>
      <input
        type="text"
        id="nationalId"
        name="nationalId"
        autoComplete="username"
        placeholder="*"
        value={formData.nationalId}
        onChange={updateField}
      />
      {errors.nationalId && <p className="error">{errors.nationalId}</p>}

      {isAuth && (
        <>
          <label htmlFor="password">סיסמה</label>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="*"
            value={formData.password}
            onChange={updateField}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </>
      )}

      <label htmlFor="userEmail">כתובת דואר אלקטרוני</label>
      <input
        type="text"
        id="userEmail"
        name="userEmail"
        autoComplete="email"
        value={formData.userEmail}
        onChange={updateField}
      />
      {errors.userEmail && <p className="error">{errors.userEmail}</p>}

      <label htmlFor="userPhoneNumber">מספר טלפון</label>
      <input
        type="text"
        id="userPhoneNumber"
        name="userPhoneNumber"
        autoComplete="tel"
        value={formData.userPhoneNumber}
        onChange={updateField}
      />
      {errors.userPhoneNumber && (
        <p className="error">{errors.userPhoneNumber}</p>
      )}

      {!isAuth && !hideRoleSelect && (
        <>
          <label htmlFor="userRole">תפקיד</label>
          <select
            id="userRole"
            name="role"
            value={formData.role}
            onChange={updateField}
          >
            <option value="">בחר תפקיד</option>
            <option value="coordinator">רכז טיולים</option>
            <option value="teacher">מורה</option>
          </select>
          {errors.role && <p className="error">{errors.role}</p>}
        </>
      )}

      <div className="form-actions">
        {!isAuth && success && <p className="add-employee-success">{success}</p>}
        {!isAuth && error && <p className="add-employee-error">{error}</p>}
        {onBack && (
          <button
            type="button"
            onClick={handleBack}
            className="auth-back-button"
          >
            חזרה
          </button>
        )}
        <button type="submit" disabled={loading}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
