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

export const canManageTrip = () => isRole("principal", "coordinator");

export const canAddUser = () => isRole("principal");

export const canEditSchool = () => isRole("principal");

export const canViewTrip = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

export function canUpdateRoute(tripStatus, tripDate, tripLeaderId) {
  if (tripStatus === TRIP_STATUS.DONE) return false;
  if (tripStatus === TRIP_STATUS.POST_EDIT) return isRole("principal");

  const user = getUser();
  const isTripLeaderToday =
    Number(user.userId) === Number(tripLeaderId) &&
    toDateOnlyString(tripDate) === getTodayInIsrael();

  if (tripStatus === TRIP_STATUS.APPROVED) return isTripLeaderToday;
  if (isRole("principal", "coordinator")) return true;
  return isTripLeaderToday;
}

export const canSetPostEdit = () => isRole("principal");

export function canHandleMinorEmergency(tripDate, tripLeaderId) {
  if (toDateOnlyString(tripDate) !== getTodayInIsrael()) return false;
  if (isRole("teacher")) return true;
  const user = getUser();
  return Number(user.userId) === Number(tripLeaderId);
}

export function canHandleCriticalEmergency(tripDate, tripLeaderId) {
  if (toDateOnlyString(tripDate) !== getTodayInIsrael()) return false;
  const user = getUser();
  return Number(user.userId) === Number(tripLeaderId);
}

export const canUploadMedia = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");

export const canViewTripDetails = () =>
  isRole("principal", "coordinator", "trip leader", "teacher");
