// permissions.js — בדיקות הרשאות צד לקוח
import { getTodayInIsrael, toDateOnlyString } from "./dateUtils.js";

export function getUser() {
  return JSON.parse(sessionStorage.getItem("current-user")) || {};
}

// משתמשים יכולים להיות בעלי כמה תפקידים (למשל "teacher" וגם "trip leader"),
// לכן יש לבדוק הימצאות ברשימת כל התפקידים ולא רק מול התפקיד היחיד שנשמר לתאימות לאחור
export function isRole(...roles) {
  const user = getUser();
  const userRoles = user.roles || (user.role ? [user.role] : []);
  return roles.some((role) => userRoles.includes(role));
}

// מנהל ורכז
export const canManageTrip = () => isRole("principal", "coordinator");

// מנהל בלבד
export const canAddUser = () => isRole("principal");

// מנהל, רכז, אחראי, מורה
export const canViewTrip = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

// עדכון מסלול: אם תאריך הטיול כבר עבר — הטופס לקריאה בלבד לכל התפקידים.
// אחרת: מנהל ורכז תמיד; אחראי טיול — רק ביום הטיול עצמו
export function canUpdateRoute(tripDate) {
  const today = getTodayInIsrael();
  const date = toDateOnlyString(tripDate);
  if (date && date < today) return false;

  if (isRole("principal", "coordinator")) return true;
  if (isRole("trip leader")) {
    return date === today;
  }
  return false;
}

// פתיחת/סגירת חירום מינורי — אחראי ומורה
export const canHandleMinorEmergency = () =>
  isRole("trip leader", "teacher");

// פתיחת/סגירת חירום קריטי — אחראי ביום הטיול
export function canHandleCriticalEmergency(tripDate) {
  if (!isRole("trip leader")) return false;
  return toDateOnlyString(tripDate) === getTodayInIsrael();
}

// העלאת קבצי תיעוד (מדיה) — מנהל, רכז, אחראי, מורה
export const canUploadMedia = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

// צפייה במסלול ובפרטי צוות — מנהל, רכז, אחראי, מורה
export const canViewTripDetails = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");
