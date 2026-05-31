import { useState } from "react";
import "./SchoolDetails.css"
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

export default function SchoolDetails({ onSubmit }) {
  const [formData, setFormData] = useState(defaultSchoolDetails);

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
      <label htmlFor="schoolName">שם המוסד</label>
      <input
        type="text"
        id="schoolName"
        name="name"
        value={formData.name}
        onChange={updateField}
      />

      <label htmlFor="schoolInstitutionNumber">סמל מוסד</label>
      <input
        type="number"
        id="schoolInstitutionNumber"
        name="institutionNumber"
        value={formData.institutionNumber}
        onChange={updateField}
      />

      <label htmlFor="schoolEmail">כתובת דואר אלקטרוני ליצרת קשר</label>
      <input
        type="email"
        id="schoolEmail"
        name="email"
        value={formData.email}
        onChange={updateField}
      />

      <label htmlFor="schoolPhoneNumber">מספר טלפון ליצרת קשר</label>
      <input
        type="text"
        id="schoolPhoneNumber"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={updateField}
      />

      <label htmlFor="city">כתובת - עיר</label>
      <input
        type="text"
        id="city"
        name="city"
        value={formData.city}
        onChange={updateField}
      />

      <label htmlFor="street">כתובת - רחוב</label>
      <input
        type="text"
        id="street"
        name="street"
        value={formData.street}
        onChange={updateField}
      />

      <label htmlFor="houseNumber">כתובת - מספר בית</label>
      <input
        type="number"
        id="houseNumber"
        name="houseNumber"
        value={formData.houseNumber}
        onChange={updateField}
      />

      <label htmlFor="postalCode">מיקוד</label>
      <input
        type="number"
        id="postalCode"
        name="postalCode"
        value={formData.postalCode}
        onChange={updateField}
      />

      <button type="submit">שמירת פרטי מוסד</button>
    </form>
  );
}
