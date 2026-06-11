// פונקציות עזר לתאריכים — מבטיחות ש"תאריך של היום" יחושב תמיד לפי שעון ישראל,
// בלי קשר לאזור הזמן שבו פועל השרת בפועל (לדוגמה שרת ענן שרץ ב-UTC)
const ISRAEL_TIME_ZONE = "Asia/Jerusalem";

// מחזיר את תאריך היום בפורמט "YYYY-MM-DD" לפי שעון ישראל
export function getTodayInIsrael() {
  return new Date().toLocaleDateString("en-CA", { timeZone: ISRAEL_TIME_ZONE });
}
