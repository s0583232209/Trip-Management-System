//this is BL layer
import * as emergenciesRepository from "../repositories/emergencies.repository.js";
import * as tripsRepository from "../repositories/trips.repository.js";
import loggerService from "./logger.service.js";

export async function getEmergenciesByTripId(tripId) {
  return await emergenciesRepository.getEmergenciesByTripId(tripId);
}

export async function createEmergency(emergencyData) {
  const trip = await tripsRepository.getTripDate(emergencyData.tripId);
  if (!trip) {
    const err = new Error("Trip not found");
    err.status = 402;
    throw err;
  }
  const tripDate = new Date(trip.trip_date).toDateString();
  const today = new Date().toDateString();
  if (tripDate !== today) {
    const err = new Error("Cannot open emergency — today is not the trip date");
    err.status = 402;
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

  return { id: result.insertId, ...emergencyData };
}

export async function updateEmergency(emergencyId, emergencyData) {
  return await emergenciesRepository.updateEmergency(
    emergencyId,
    emergencyData,
  );
}

export async function deleteEmergency(emergencyId) {
  return await emergenciesRepository.deleteEmergency(emergencyId);
}
