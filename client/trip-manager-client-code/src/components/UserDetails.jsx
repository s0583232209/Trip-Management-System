import { useState } from "react";
import "./UserDetails.css";
const defaultUserDetails = {
  name: "",
  nationalId: "",
  password: "",
  email: "",
  phoneNumber: "",
  institutionNumber: "",
};

export default function UserDetails({ onSubmit }) {
  const [formData, setFormData] = useState(defaultUserDetails);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  function submitForm(event) {
    event.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={submitForm}>
      <label htmlFor="name">שם מלא</label>
      <input
        type="text"
        id="name"
        name="name"
        autoComplete="שם מלא"
        value={formData.name}
        onChange={updateField}
      />

      <label htmlFor="nationalId">מספר תעודת זהות</label>
      <input
        type="text"
        id="nationalId"
        name="nationalId"
        autoComplete="מספר תעודת זהות"
        value={formData.nationalId}
        onChange={updateField}
      />

      <label htmlFor="password">סיסמה</label>
      <input
        type="password"
        id="password"
        name="password"
        autoComplete="סיסמה"
        value={formData.password}
        onChange={updateField}
      />

      <label htmlFor="email">כתובת דואר אלקטרוני</label>
      <input
        type="email"
        id="email"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={updateField}
      />

      <label htmlFor="phoneNumber">מספר טלפון</label>
      <input
        type="text"
        id="phoneNumber"
        name="phoneNumber"
        autoComplete="מספר טלפון"
        value={formData.phoneNumber}
        onChange={updateField}
      />

      <label htmlFor="institutionNumber">סמל מוסד</label>
      <input
        type="number"
        id="institutionNumber"
        name="institutionNumber"
        autoComplete="סמל מוסד"
        value={formData.institutionNumber}
        onChange={updateField}
      />

      <button type="submit">שמירת פרטי משתמש</button>
    </form>
  );
}
