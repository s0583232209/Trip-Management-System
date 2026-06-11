// permissions.js — בדיקות הרשאות צד לקוח
import { getTodayInIsrael, toDateOnlyString } from "./dateUtils.js";

export function getUser() {
  return JSON.parse(sessionStorage.getItem("current-user")) || {};
}

export function isRole(...roles) {
  const user = getUser();
  return roles.includes(user.role);
}

// ממיר תאריך (Date / מחרוזת ISO מהשרת / "YYYY-MM-DD") למחרוזת תאריך לפי שעון מקומי (ישראל),
// בניגוד ל-toISOString שממיר ל-UTC ועלול להחזיר את היום הקודם
function toLocalDateString(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-CA");
}

// מנהל ורכז
export const canManageTrip = () => isRole("principal", "coordinator");

// מנהל בלבד
export const canAddUser = () => isRole("principal");

// מנהל, רכז, אחראי, מורה
export const canViewTrip = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

// עדכון מסלול: מנהל ורכז תמיד; אחראי — רק ביום הטיול
export function canUpdateRoute(tripDate) {
  const user = getUser();
  if (isRole("principal", "coordinator")) return true;
  if (user.role === "trip leader") {
    const today = toLocalDateString(new Date());
    return toLocalDateString(tripDate) === today;
  }
  return false;
}

// פתיחת/סגירת חירום מינורי — אחראי ומורה
export const canHandleMinorEmergency = () =>
  isRole("trip leader", "teacher");

// פתיחת/סגירת חירום קריטי — אחראי ביום הטיול
export function canHandleCriticalEmergency(tripDate) {
  if (!isRole("trip leader")) return false;
  const today = toLocalDateString(new Date());
  return toLocalDateString(tripDate) === today;
}

// העלאת קבצי תיעוד (מדיה) — מנהל, רכז, אחראי, מורה
export const canUploadMedia = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

// צפייה במסלול ובפרטי צוות — מנהל, רכז, אחראי, מורה
export const canViewTripDetails = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");
