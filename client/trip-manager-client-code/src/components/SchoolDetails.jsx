import { useEffect, useState } from "react";
import "./SchoolDetails.css";
const defaultSchoolDetails = {
  name: "",
  institutionNumber: "",
  email: "",
  phoneNumber: "",
  city: "",
  street: "",
  houseNumber: "",
  postalCode: "",
};

export default function SchoolDetails({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData || defaultSchoolDetails);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  const nameRegex = /^[\p{L}\d\s]{2,}$/u;
  const institutionNumberRegex = /^\d{6}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[\d\s-]{7,15}$/;
  const cityRegex = /^[\p{L}\s]{2,}$/u;
  const streetRegex = /^[\p{L}\d\s-]{2,}$/u;
  const houseNumberRegex = /^\d+$/;
  const postalCodeRegex = /^\d{5,7}$/;

  function submitForm(event) {
    event.preventDefault();

    const newErrors = {};

    if (!nameRegex.test(formData.name)) {
      newErrors.name = "שם המוסד חייב להכיל לפחות 2 אותיות";
    }

    if (!institutionNumberRegex.test(formData.institutionNumber)) {
      newErrors.institutionNumber = "סמל מוסד חייב להכיל 6 ספרות בדיוק";
    }

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "כתובת דואר אלקטרוני לא תקינה";
    }

    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "מספר טלפון לא תקין";
    }

    if (formData.city && !cityRegex.test(formData.city)) {
      newErrors.city = "הזן שם עיר תקין";
    }

    if (formData.street && !streetRegex.test(formData.street)) {
      newErrors.street = "הזן שם רחוב תקין";
    }

    if (formData.houseNumber && !houseNumberRegex.test(formData.houseNumber)) {
      newErrors.houseNumber = "מספר בית חייב להכיל ספרות בלבד";
    }

    if (formData.postalCode && !postalCodeRegex.test(formData.postalCode)) {
      newErrors.postalCode = "מיקוד חייב להכיל 5 עד 7 ספרות";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  }

  return (
    <form onSubmit={submitForm}>
      <label htmlFor="schoolName">שם המוסד</label>
      <input
        type="text"
        id="schoolName"
        name="name"
        placeholder="*"
        required
        value={formData.name}
        onChange={updateField}
      />
      {errors.name && <p className="error">{errors.name}</p>}

      <label htmlFor="schoolInstitutionNumber">סמל מוסד</label>
      <input
        type="text"
        inputMode="numeric"
        id="schoolInstitutionNumber"
        name="institutionNumber"
        placeholder="*"
        required
        value={formData.institutionNumber}
        onChange={updateField}
      />
      {errors.institutionNumber && (
        <p className="error">{errors.institutionNumber}</p>
      )}

      <label htmlFor="schoolEmail">כתובת דואר אלקטרוני ליצירת קשר</label>
      <input
        type="email"
        id="schoolEmail"
        name="email"
        value={formData.email}
        onChange={updateField}
      />
      {errors.email && <p className="error">{errors.email}</p>}

      <label htmlFor="schoolPhoneNumber">מספר טלפון ליצירת קשר</label>
      <input
        type="text"
        id="schoolPhoneNumber"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={updateField}
      />
      {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}

      <label htmlFor="city">עיר</label>
      <input
        type="text"
        id="city"
        name="city"
        value={formData.city}
        onChange={updateField}
      />
      {errors.city && <p className="error">{errors.city}</p>}

      <label htmlFor="street">רחוב</label>
      <input
        type="text"
        id="street"
        name="street"
        value={formData.street}
        onChange={updateField}
      />
      {errors.street && <p className="error">{errors.street}</p>}

      <label htmlFor="houseNumber">מספר בית</label>
      <input
        type="text"
        inputMode="numeric"
        id="houseNumber"
        name="houseNumber"
        value={formData.houseNumber}
        onChange={updateField}
      />
      {errors.houseNumber && <p className="error">{errors.houseNumber}</p>}

      <label htmlFor="postalCode">מיקוד</label>
      <input
        type="text"
        inputMode="numeric"
        id="postalCode"
        name="postalCode"
        value={formData.postalCode}
        onChange={updateField}
      />
      {errors.postalCode && <p className="error">{errors.postalCode}</p>}

      <button type="submit">הבא</button>
    </form>
  );
}
