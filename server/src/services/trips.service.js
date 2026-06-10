//this is BL layer
import log from "../loggers/file.logger.js";
import * as tripsRepo from "../repositories/trips.repository.js";
import * as usersRepo from "../repositories/users.repository.js";
import * as authService from "./auth.service.js";
export async function getAllTrips(userId) {
  const trips = await tripsRepo.getAll(userId);
  log.info(`get all trips by userId: ${userId}`);
  return trips;
}
export async function getById(tripId, userId) {
  try {
    const trip = await tripsRepo.getById(tripId,userId);
    // console.log(trip, "this is the trip from the service");
    log.info(`get trip by id: ${tripId} and userId: ${userId}`);
    // console.log(trip, "thi is thrip in service");
    return trip;
  } catch (err) {
    log.warn(`error: ${err.message}`);
    throw err;
  }
}
export async function addTrip(tripDetails) {
  try {
    const { school_id } = await usersRepo.getById(tripDetails.tripLeaderId);
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
    let tripLeaderId;
    const val = String(tripDetails.tripLeaderNationalId || "").trim();

    if (val.length === 9 && !isNaN(Number(val))) {
      // ת"ז תקין — מחפש לפי national_id
      const user = await usersRepo.getByNationalId(val);
      tripLeaderId = user.id;
    } else if (val && !isNaN(Number(val))) {
      // DB id מספרי (מה-dropdown)
      tripLeaderId = Number(val);
    } else {
      // שומר את הערך הקיים מה-DB
      const existing = await tripsRepo.getById(tripDetails.tripId, null);
      tripLeaderId = existing?.trip_leader_id || null;
    }

    const updatedTrip = await tripsRepo.updateTrip({
      tripLeaderId,
      tripId: tripDetails.tripId,
      title: tripDetails.title,
      tripDate: tripDetails.tripDate,
      routeGeoJson: tripDetails.routeGeoJson,
    });
    return updatedTrip;
  } catch (err) {
    log.warn(`error: ${err.message}, from function updateTrip in trips.service`);
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
    const parentToken = authService.createParentToken(tripId);
    const approvedTrip = await tripsRepo.approveTrip(tripId, parentToken);
    log.info(`approved trip with id: ${tripId}`);
    return { parentToken, ...approvedTrip };
  } catch (err) {
    // console.log(err, "this is err in approve trip service");
    log.warn(`error: ${err.message}, from approveTrip in trips.service`);
    throw err;
  }
}
export async function addStaff(tripId, nationalIds) {
  try {
    const users = await Promise.all(
      nationalIds.map((id) => usersRepo.getByNationalId(id)),
    );
    const staffIds = users.map((u) => u.id);
    await tripsRepo.addStaff(tripId, staffIds);
    log.info(`staff added to trip: ${tripId}`);
  } catch (err) {
    log.warn(`error: ${err.message}, from addStaff in trips.service`);
    throw err;
  }

  const token = authService.createParentToken({
    tripId,
    tripDate: new Date(),
  });
  return token;
}
