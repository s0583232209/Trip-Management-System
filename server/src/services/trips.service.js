//this is BL layer
import log from "../loggers/file.logger.js";
import * as tripsRepo from "../repositories/trips.repository.js";
import * as usersRepo from "../repositories/users.repository.js";
export async function getAllTrips(userId) {
  const trips = await getAll(userId);
  log.info(`get all trips by userId: ${userId}`);
  return trips;
}
export async function getById(tripId, userId) {
  try {
    const trip = await tripsRepo.getAll(tripId, userId);
    log.info(`get trip by id: ${tripId} and userId: ${userId}`);
    return trip;
  } catch (err) {
    log.warn(`error: ${err.message}`);
    throw err;
  }
}
export async function addTrip(tripDetails) {
  try {
    const { school_id } = await usersRepo.getbyNationalId(
      tripDetails.tripLeaderId,
    );
    log.info(`the school id from add trip is: ${school_id}`);
    const newTrip = await tripsRepo.addTrip({
      schoolId: school_id,
      ...tripDetails,
    });
    log.info(`trip added successfully`);
    return newTrip;
  } catch (err) {
    log.warn(`error: ${err.message}, from function addTrip in trips.service`);
    throw err;
  }
}
export async function updateTrip(tripDetails) {
  try {
    const [id] = await usersRepo.getById(tripDetails.tripLeaderNationalId);
    const updatedTrip = await tripsRepo.updateTrip({
      tripLeaderId: id,
      ...tripDetails,
    });
    return updateTrip;
  } catch (err) {
    console.log(err, "this is the err in update trip service");
    console.log(tripDetails, "this is the trip details in service");
    log.warn(
      `error: ${err.message}, from function updateTrip in trips.service`,
    );
    throw err;
  }
}
export async function deleteTrip(tripId) {
  try {
    const res = await tripsRepo.deleteTrip(tripId);
    log.info(`deleted trip with id: ${tripId}`);
    return res;
  } catch (err) {
    log.warn(`error: ${err.message}, from deleteTrip in trips.service`);
    throw err;
  }
}
