import log from "../loggers/file.logger.js";
import * as tripsRepo from "../repositories/trips.repository.js";
import * as usersRepo from "../repositories/users.repository.js";
import * as filesRepo from "../repositories/files.repository.js";
import * as authService from "./auth.service.js";

async function getMissingRequiredDocs(tripId) {
  const [uploaded, routeGeoJson] = await Promise.all([
    filesRepo.getKit(tripId),
    tripsRepo.getRouteGeoJson(tripId),
  ]);
  const uploadedCodes = new Set(uploaded.map((f) => f.file_code));
  const required = [...REQUIRED_TRIP_DOCS, ...getAttractionDocs(routeGeoJson)];
}
export async function getAllTrips(userId) {
  const trips = await tripsRepo.getAll(userId);
  log.info(`get all trips by userId: ${userId}`);
  return trips;
}
export async function getById(tripId, userId) {
  try {
    const trip = await tripsRepo.getById(tripId, userId);
    log.info(`get trip by id: ${tripId} and userId: ${userId}`);
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
      const user = await usersRepo.getByNationalId(val);
      tripLeaderId = user.id;
    } else if (val && !isNaN(Number(val))) {
      tripLeaderId = Number(val);
    } else {
      const connection = await (await import("../config/db.js")).default();

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
    const uncoveredClasses = await tripsRepo.getUncoveredClasses(tripId);
    if (uncoveredClasses.length > 0) {
      const names = uncoveredClasses.map((c) => c.class_name).join(", ");
      const err = new Error(
        `לא ניתן לאשר את הטיול: לכיתות הבאות אין מורה משובץ: ${names}`,
      );
      err.status = 400;
      throw err;
    }

    const missingDocs = await getMissingRequiredDocs(tripId);
    if (missingDocs.length > 0) {
      const err = new Error(
        `לא ניתן לאשר את הטיול: חסרים המסמכים הבאים בתיק הטיול: ${missingDocs.join(", ")}`,
      );
      err.status = 400;
      throw err;
    }

    const approvedTrip = await tripsRepo.approveTrip(tripId, parentToken);
    log.info(`approved trip with id: ${tripId}`);
    return { parentToken, ...approvedTrip };
  } catch (err) {
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
    return closedTrip;
  } catch (err) {
    log.warn(`error: ${err.message}, from closeTrip in trips.service`);
    throw err;
  }
}

export async function setPostEdit(tripId, note) {
  if (!note?.trim()) {
    const err = new Error("יש לספק הערת הסבר לתיקון בדיעבד");
    err.status = 400;
    throw err;
  }
  try {
    const result = await tripsRepo.setPostEdit(tripId, note.trim());
    log.info(`trip ${tripId} set to post-edit`);
    return result;
  } catch (err) {
    log.warn(`error: ${err.message}, from setPostEdit in trips.service`);
    throw err;
  }
}

export async function getTripClasses(tripId) {
  return tripsRepo.getTripClasses(tripId);
}

export async function getSchoolClasses(tripId) {
  return tripsRepo.getSchoolClasses(tripId);
}

export async function setTripClasses(tripId, classIds) {
  return tripsRepo.setTripClasses(tripId, classIds);
}
