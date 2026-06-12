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
    const trip = await tripsRepo.getById(tripId, userId);
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
    // אישור הטיול חסום אם קיימת כיתה המשובצת לטיול שאין לה אף איש צוות
    const uncoveredClasses = await tripsRepo.getUncoveredClasses(tripId);
    if (uncoveredClasses.length > 0) {
      const names = uncoveredClasses.map((c) => c.class_name).join(", ");
      const err = new Error(
        `לא ניתן לאשר את הטיול: לכיתות הבאות אין מורה משובץ: ${names}`,
      );
      err.status = 400;
      throw err;
    }

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
export async function addStaff(tripId, staffAssignments) {
  try {
    await tripsRepo.addStaff(tripId, staffAssignments);
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
export async function getAllStaff(tripId) {
  try {
    const staff = await tripsRepo.getAllStaff(tripId);
    log.info(`all staff returned successfully`);
    return staff;
  } catch (err) {
    log.warn(`error: ${err.message}, from getAllStaff in trips.service`);
    throw err;
  }
}
export async function deleteStaff(tripId, staffId) {
  try {
    const res = await tripsRepo.deleteStaff(tripId, staffId);
    log.info(`staff ${staffId} removed from trip: ${tripId}`);
    return res;
  } catch (err) {
    log.warn(`error: ${err.message}, from deleteStaff in trips.service`);
    throw err;
  }
}
export async function addExternalStaff(tripId, staffDetails) {
  try {
    console.log("in add staff service, details=", staffDetails);
    const newStaff = await tripsRepo.addExternalStaff(tripId, staffDetails);
    log.info(`external staff added to trip: ${tripId}`);
    return newStaff;
  } catch (err) {
    log.warn(`error: ${err.message}, from addExternalStaff in trips.service`);
    throw err;
  }
}
export async function deleteExternalStaff(tripId, staffId) {
  try {
    const res = await tripsRepo.deleteExternalStaff(tripId, staffId);
    log.info(`external staff ${staffId} removed from trip: ${tripId}`);
    return res;
  } catch (err) {
    log.warn(
      `error: ${err.message}, from deleteExternalStaff in trips.service`,
    );
    throw err;
  }
}
export async function closeTrip(tripId) {
  try {
    const closedTrip = await tripsRepo.closeTrip(tripId);
    log.info(`trip with id: ${tripId} closed successfully`);
    console.log(closedTrip, "from service");
    return closedTrip;
  } catch (err) {
    log.warn(`error: ${err.message}, from closeTrip in trips.service`);
    throw err;
  }
}
