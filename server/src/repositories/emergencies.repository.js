//this is the DAL
import getConnection from "../config/db.js";
import log from "../loggers/file.logger.js";
import dblog from "../loggers/database.logger.js";

export async function getEmergenciesByTripId(tripId) {
  console.log("getEmergenciesByTripId - src/repositories/emergencies.repository.js");
  try {
    log.info(`getEmergenciesByTripId called with tripId: ${tripId}`);
    const connection = await getConnection();
    const [emergencies] = await connection.execute(
      "SELECT * FROM emergencies WHERE trip_id = ?",
      [tripId],
    );
    return emergencies;
  } catch (error) {
    log.error(
      `Error occurred while fetching emergencies for trip ${tripId}: ${error.message}`,
    );
    throw error;
  }
}

export async function createEmergency(emergencyData) {
  console.log("createEmergency - src/repositories/emergencies.repository.js");
  try {
    log.info(
      `createEmergency called with data: ${JSON.stringify(emergencyData)}`,
    );
    const connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO emergencies (trip_id, opened_by, emergency_type_id, description, status, location_lat, location_lng) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        emergencyData.tripId,
        emergencyData.openedBy || null,
        emergencyData.emergencyTypeId || 1,
        emergencyData.description,
        emergencyData.status || 1,
        emergencyData.locationLat || null,
        emergencyData.locationLng || null,
      ],
    );
    await dblog({
      userId: emergencyData.openedBy ?? null,
      actionType: "create_emergency",
      tableName: "emergencies",
      message: `emergency created with id ${result.insertId} for trip ${emergencyData.tripId}`,
      newValues: JSON.stringify({ id: result.insertId, ...emergencyData }),
    });
    return result;
  } catch (error) {
    log.error(`Error occurred while creating emergency: ${error.message}`);
    throw error;
  }
}

export async function deleteEmergency(emergencyId) {
  console.log("deleteEmergency - src/repositories/emergencies.repository.js");
  try {
    log.info(`deleteEmergency called with emergencyId: ${emergencyId}`);
    const connection = await getConnection();
    const [result] = await connection.execute(
      "DELETE FROM emergencies WHERE id = ?",
      [emergencyId],
    );
    return result;
  } catch (error) {
    log.error(
      `Error occurred while deleting emergency with id ${emergencyId}: ${error.message}`,
    );
    throw error;
  }
}

export async function updateEmergency(emergencyId, emergencyData) {
  console.log("updateEmergency - src/repositories/emergencies.repository.js");
  try {
    log.info(
      `updateEmergency called with emergencyId: ${emergencyId} and data: ${JSON.stringify(emergencyData)}`,
    );
    const connection = await getConnection();
    const [result] = await connection.execute(
      "UPDATE emergencies SET description = ?, status = ?, location_lat = ?, location_lng = ?, closed_at = ? WHERE id = ?",
      [
        emergencyData.description,
        emergencyData.status || 1,
        emergencyData.locationLat || null,
        emergencyData.locationLng || null,
        emergencyData.status === 2 ? new Date() : null,
        emergencyId,
      ],
    );
    return result;
  } catch (error) {
    log.error(
      `Error occurred while updating emergency with id ${emergencyId}: ${error.message}`,
    );
    throw error;
  }
}
