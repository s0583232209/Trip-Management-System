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

export async function updateEmergency(emergencyId, emergencyData) {
  console.log("updateEmergency - src/services/emergencies.service.js");
  return await emergenciesRepository.updateEmergency(
    emergencyId,
    emergencyData,
  );
}

export async function deleteEmergency(emergencyId) {
  console.log("deleteEmergency - src/services/emergencies.service.js");
  return await emergenciesRepository.deleteEmergency(emergencyId);
}
