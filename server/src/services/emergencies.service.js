//this is BL layer
import * as emergenciesRepository from "../repositories/emergencies.repository.js";
import * as tripsRepository from "../repositories/trips.repository.js";
import loggerService from "./logger.service.js";
import { getTodayInIsrael } from "../utils/date.util.js";

export async function getEmergenciesByTripId(tripId) {
  return await emergenciesRepository.getEmergenciesByTripId(tripId);
}

export async function createEmergency(emergencyData) {
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

  // סגירת חירום קריטי מותרת רק למי שפתח אותו
  const isCritical = emergency.emergency_type_id === 2;
  const isClosing = parseInt(emergencyData.status) === 2;
  if (isCritical && isClosing && Number(emergency.opened_by) !== Number(userId)) {
    const err = new Error("סגירת חירום קריטי מותרת לאחראי הטיול שפתח אותו בלבד");
    err.status = 403;
    throw err;
  }

  return await emergenciesRepository.updateEmergency(
    emergencyId,
    emergencyData,
  );
}

export async function deleteEmergency(emergencyId) {
  return await emergenciesRepository.deleteEmergency(emergencyId);
}
