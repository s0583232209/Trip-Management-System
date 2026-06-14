// permissions.js — בדיקות הרשאות צד לקוח
import { toDateOnlyString, getTodayInIsrael } from "./dateUtils.js";
import { store } from "./store/store.js";

export const TRIP_STATUS = {
  PLANNED:   1,
  APPROVED:  2,
  DONE:      3,
  POST_EDIT: 4,
};

export const TRIP_STATUS_LABEL = {
  1: "מתוכנן",
  2: "מאושר",
  3: "עבר",
  4: "תיקון בדיעבד",
};

export function getUser() {
  return store.getState().auth.user || {};
}

export function isRole(...roles) {
  const user = getUser();
  const userRoles = user.roles || (user.role ? [user.role] : []);
  return roles.some((role) => userRoles.includes(role));
}

// מנהל ורכז
export const canManageTrip = () => isRole("principal", "coordinator");

// מנהל בלבד
export const canAddUser = () => isRole("principal");

// עדכון פרטי מוסד — מנהל בלבד
export const canEditSchool = () => isRole("principal");

// מנהל, רכז, אחראי, מורה
export const canViewTrip = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

// עדכון מסלול לפי סטטוס:
// planned   — עריכה מלאה לכולם עם הרשאה
// approved  — נעול לכולם (פתיחה רק דרך post-edit)
// post-edit — עריכה למנהל/רכז בלבד
// done      — נעול לחלוטין
// "אחראי טיול" אינו תפקיד גלובלי — ההרשאה נקבעת לפי trips.trip_leader_id של הטיול הספציפי
export function canUpdateRoute(tripStatus, tripDate, tripLeaderId) {
  if (tripStatus === TRIP_STATUS.DONE) return false;
  if (tripStatus === TRIP_STATUS.APPROVED) return false;
  if (tripStatus === TRIP_STATUS.POST_EDIT) return isRole("principal");
  // planned (או null לתאימות לאחור)
  if (isRole("principal", "coordinator")) return true;
  const user = getUser();
  if (Number(user.userId) === Number(tripLeaderId)) {
    return toDateOnlyString(tripDate) === getTodayInIsrael();
  }
  return false;
}

// פתיחת עריכה בדיעבד — מנהל בלבד
export const canSetPostEdit = () => isRole("principal");

// פתיחת/סגירת חירום מינורי — אחראי הטיול הספציפי או מורה, רק ביום הטיול
export function canHandleMinorEmergency(tripDate, tripLeaderId) {
  if (toDateOnlyString(tripDate) !== getTodayInIsrael()) return false;
  if (isRole("teacher")) return true;
  const user = getUser();
  return Number(user.userId) === Number(tripLeaderId);
}

// פתיחת/סגירת חירום קריטי — אחראי הטיול הספציפי בלבד, רק ביום הטיול
export function canHandleCriticalEmergency(tripDate, tripLeaderId) {
  if (toDateOnlyString(tripDate) !== getTodayInIsrael()) return false;
  const user = getUser();
  return Number(user.userId) === Number(tripLeaderId);
}

// העלאת קבצי תיעוד (מדיה) — מנהל, רכז, אחראי, מורה
export const canUploadMedia = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

// צפייה במסלול ובפרטי צוות — מנהל, רכז, אחראי, מורה
export const canViewTripDetails = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");
