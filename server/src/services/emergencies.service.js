//this is BL layer
import * as emergenciesRepository from "../repositories/emergencies.repository.js";
import loggerService from "./logger.service.js";

export async function getEmergenciesByTripId(tripId) {
  return await emergenciesRepository.getEmergenciesByTripId(tripId);
}

export async function createEmergency(emergencyData) {
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
