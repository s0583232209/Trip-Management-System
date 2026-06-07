//this is BL layer
import log from "../loggers/file.logger.js";
import * as tripsRepo from "../repositories/trips.repository.js";
import * as usersRepo from "../repositories/users.repository.js";
import * as authService from "./auth.service.js";
export async function getAllTrips(userId) {
  const trips = await getAll(userId);
  log.info(`get all trips by userId: ${userId}`);
  return trips;
}
export async function getById(tripId, userId) {
  try {
<<<<<<< HEAD
    const trip = await tripsRepo.getById(tripId, userId);
=======
    const trip = await tripsRepo.getAll(tripId, userId);
    console.log(trip, "this is the trip from the service");
>>>>>>> Trips
    log.info(`get trip by id: ${tripId} and userId: ${userId}`);
    console.log(trip,"thi is thrip in service")
    return trip;
  } catch (err) {
    log.warn(`error: ${err.message}`);
    throw err;
  }
}
export async function addTrip(tripDetails) {
  try {
    const { school_id } = await usersRepo.getByNationalId(
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
    const res = await usersRepo.getByNationalId(
      tripDetails.tripLeaderNationalId,
    );
    console.log(res, "this is res in service");
    const updatedTrip = await tripsRepo.updateTrip({
      tripLeaderId: res.id,
      ...tripDetails,
    });
    return updatedTrip;
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
export async function approveTrip(tripId) {
  try {
    const parentToken = await createParentToken(tripId);
    const approvedTrip = await tripsRepo.approveTrip(tripId, parentToken);
    log.info(`approved trip with id: ${tripId}`);
    return { parentToken, ...approvedTrip };
  } catch (err) {
    console.log(err, "this is err in approve trip service");
    log.warn(`error: ${err.message}, from approveTrip in trips.service`);
    throw err;
  }
}
export async function createParentToken(tripId) {
  const token = authService.createParentToken({
    tripId,
    tripDate: new Date(),
  });
  return token;
}
