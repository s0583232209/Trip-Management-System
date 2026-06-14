//this is BL layer
import * as emergenciesRepository from "../repositories/emergencies.repository.js";
import * as tripsRepository from "../repositories/trips.repository.js";
import loggerService from "./logger.service.js";
import { getTodayInIsrael } from "../utils/date.util.js";

export async function getEmergenciesByTripId(tripId) {
  console.log("getEmergenciesByTripId - src/services/emergencies.service.js");
  return await emergenciesRepository.getEmergenciesByTripId(tripId);
}

export async function createEmergency(emergencyData) {
  console.log("createEmergency - src/services/emergencies.service.js");
  const trip = await tripsRepository.getTripDate(emergencyData.tripId);
  if (!trip) {
    const err = new Error("Trip not found");
    err.status = 404;
    throw err;
  }
  // trip_date מגיע כבר כמחרוזת "YYYY-MM-DD" (ראו dateStrings ב-db.js), ללא צורך בהמרת אזור זמן
  const tripDate = trip.trip_date;
  const today = getTodayInIsrael();
  if (tripDate !== today) {
    const err = new Error("Cannot open emergency — today is not the trip date");
    err.status = 400;
    throw err;
  }

  // הרשאות פתיחת חירום: קריטי — אחראי הטיול הספציפי בלבד;
  // מינורי — אחראי הטיול הספציפי או מורה המשובץ לטיול
  const isTripLeader = Number(trip.trip_leader_id) === Number(emergencyData.openedBy);
  const isCritical = Number(emergencyData.emergencyTypeId) === 2;
  if (isCritical) {
    if (!isTripLeader) {
      const err = new Error("דיווח על חירום קריטי מותר לאחראי הטיול בלבד");
      err.status = 403;
      throw err;
    }
  } else {
    const isTeacherStaff = await tripsRepository.isTripTeacherStaff(
      emergencyData.tripId,
      emergencyData.openedBy,
    );
    if (!isTripLeader && !isTeacherStaff) {
      const err = new Error("דיווח על חירום מותר לאחראי הטיול או למורה המשובץ לטיול בלבד");
      err.status = 403;
      throw err;
    }
  }

  const result = await emergenciesRepository.createEmergency(emergencyData);

  await loggerService({
    userId: emergencyData.openedBy,
    actionType: "EMERGENCY_OPENED",
    message: `מצב חירום נפתח לטיול ${emergencyData.tripId}. תיאור: ${emergencyData.description}`,
    tableName: "emergencies",
    newValues: JSON.stringify(emergencyData),
  });

  return { id: result.insertId, ...emergencyData, opened_at: new Date() };
}

export async function updateEmergency(emergencyId, emergencyData, tripId, userId) {
  console.log("updateEmergency - src/services/emergencies.service.js");
  const emergency = await emergenciesRepository.getEmergencyById(emergencyId);
  if (!emergency) {
    const err = new Error("Emergency not found");
    err.status = 404;
    throw err;
  }

  // האירוע חייב להשתייך לטיול שמופיע ב-route, אחרת ניתן היה לעדכן/לסגור
  // אירוע של טיול אחר רק ע"י ניחוש emergencyId
  if (String(emergency.trip_id) !== String(tripId)) {
    const err = new Error("Emergency does not belong to this trip");
    err.status = 403;
    throw err;
  }

  const isCritical = emergency.emergency_type_id === 2;
  const isClosing = parseInt(emergencyData.status) === 2;

  if (isClosing) {
    // חירום ניתן לסגור רק ביום הטיול
    const trip = await tripsRepository.getTripDate(tripId);
    const today = getTodayInIsrael();
    if (!trip || trip.trip_date !== today) {
      const err = new Error("ניתן לסגור אירוע חירום רק ביום הטיול");
      err.status = 403;
      throw err;
    }

    const isTripLeader = Number(trip.trip_leader_id) === Number(userId);

    if (isCritical) {
      // סגירת חירום קריטי מותרת רק למי שפתח אותו
      if (Number(emergency.opened_by) !== Number(userId)) {
        const err = new Error("סגירת חירום קריטי מותרת לאחראי הטיול שפתח אותו בלבד");
        err.status = 403;
        throw err;
      }
    } else {
      // סגירת חירום מינורי מותרת לאחראי הטיול או למורה המשובץ לטיול
      const isTeacherStaff = await tripsRepository.isTripTeacherStaff(tripId, userId);
      if (!isTripLeader && !isTeacherStaff) {
        const err = new Error("סגירת חירום מותרת לאחראי הטיול או למורה המשובץ לטיול בלבד");
        err.status = 403;
        throw err;
      }
    }
  }

  return await emergenciesRepository.updateEmergency(
    emergencyId,
    emergencyData,
  );
}

export async function deleteEmergency(emergencyId) {
  console.log("deleteEmergency - src/services/emergencies.service.js");
  return await emergenciesRepository.deleteEmergency(emergencyId);
}
