// פונקציות עזר לתאריכים בצד הקליינט — מבטיחות שהשוואות "תאריך של היום" יתבצעו
// תמיד לפי שעון ישראל, בלי קשר לאזור הזמן שבו מוגדר הדפדפן של המשתמש
const ISRAEL_TIME_ZONE = "Asia/Jerusalem";

// מחזיר את תאריך היום בפורמט "YYYY-MM-DD" לפי שעון ישראל
export function getTodayInIsrael() {
  return new Date().toLocaleDateString("en-CA", { timeZone: ISRAEL_TIME_ZONE });
}

// ממיר ערך תאריך שמגיע מהשרת (מחרוזת "YYYY-MM-DD", או "YYYY-MM-DDTHH:mm:ss.sssZ") למחרוזת "YYYY-MM-DD" בלבד
export function toDateOnlyString(value) {
  if (!value) return "";
  return String(value).split("T")[0];
}
