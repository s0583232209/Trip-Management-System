//this is BL layer
import log from "../loggers/file.logger.js";
import { getAll } from "../repositories/trips.repository.js";
export async function getAllTrips(userId) {
  const trips = await getAll(userId);
  log.info(`get all trips by userId: ${userId}`);
  return trips;
}
export async function getById(tripId, userId) {
  try {
    const trip = await getAll(tripId, userId);
    log.info(`get trip by id: ${tripId} and userId: ${userId}`);
    return trip;
  } catch (err) {
    log.warn(`error: ${err.message}`);
    throw err;
  }
}
