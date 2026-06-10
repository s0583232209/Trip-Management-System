// permissions.js — בדיקות הרשאות צד לקוח

export function getUser() {
  return JSON.parse(sessionStorage.getItem("current-user")) || {};
}

export function isRole(...roles) {
  const user = getUser();
  return roles.includes(user.role);
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
    const today = new Date().toISOString().split("T")[0];
    const date =
      tripDate instanceof Date
        ? tripDate.toISOString().split("T")[0]
        : String(tripDate).split("T")[0];
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
  const today = new Date().toISOString().split("T")[0];
  const date =
    tripDate instanceof Date
      ? tripDate.toISOString().split("T")[0]
      : String(tripDate).split("T")[0];
  return date === today;
}

// העלאת קבצי תיעוד (מדיה) — מנהל, רכז, אחראי, מורה
export const canUploadMedia = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

// צפייה במסלול ובפרטי צוות — מנהל, רכז, אחראי, מורה
export const canViewTripDetails = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");
