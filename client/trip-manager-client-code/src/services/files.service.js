// שכבת שירות בצד הקליינט עבור קבצי תיק הטיול — עוטפת קריאות API ל-/api/trips/:tripId/files
import api from "../api.js";

// מחזיר את כל מסמכי תיק הטיול (קבצים עם file_code) של הטיול
export async function getTripFiles(tripId) {
  const res = await api.get(`/api/trips/${tripId}/files/kit`);
  return res.data;
}

// מעלה/מחליף מסמך בתיק הטיול. formData מכיל את הקובץ + fileCode + תיאור
export async function uploadTripFile(tripId, formData) {
  const res = await api.post(`/api/trips/${tripId}/files/kit`, formData);
  return res.data;
}

// מוחק קובץ (גם מהדיסק וגם מה-DB) לפי מזהה הקובץ
export async function deleteTripFile(tripId, fileId) {
  const res = await api.delete(`/api/trips/${tripId}/files/${fileId}`);
  return res.data;
}

// פותח קובץ בלשונית חדשה: מוריד אותו כ-blob ופותח URL זמני בדפדפן
export async function openFile(tripId, fileId) {
  const response = await api.get(`/api/trips/${tripId}/files/${fileId}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(response.data);
  window.open(url, "_blank");
  // משחררים את ה-URL הזמני אחרי שנייה, כשהוא כבר לא נחוץ
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}
