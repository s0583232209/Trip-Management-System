//this is BL layer
import log from "../loggers/file.logger.js";
import { getAll } from "../repositories/trips.repository.js";
export async function getAllTrips(userId) {
  const trips = await getAll(userId);
  log.info(`get all trips by userId: ${userId}`);
  return trips;
}
