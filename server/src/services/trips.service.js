//this is BL layer
import log from "../loggers/file.logger.js";
import * as tripsRepo from "../repositories/trips.repository.js";
import * as usersRepo from "../repositories/users.repository.js";
import * as filesRepo from "../repositories/files.repository.js";
import * as authService from "./auth.service.js";

// בודק אם בתיק הטיול חסרים מסמכי חובה (כולל אישורי אטרקציות) ומחזיר את שמותיהם
async function getMissingRequiredDocs(tripId) {
  const [uploaded, routeGeoJson] = await Promise.all([
    filesRepo.getKit(tripId),
    tripsRepo.getRouteGeoJson(tripId),
  ]);
  const uploadedCodes = new Set(uploaded.map((f) => f.file_code));
  const required = [...REQUIRED_TRIP_DOCS, ...getAttractionDocs(routeGeoJson)];
}
export async function getAllTrips(userId) {
  console.log("getAllTrips - src/services/trips.service.js");
  const trips = await tripsRepo.getAll(userId);
  log.info(`get all trips by userId: ${userId}`);
  return trips;
}
export async function getById(tripId, userId) {
  console.log("getById - src/services/trips.service.js");
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
  console.log("addTrip - src/services/trips.service.js");
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
  console.log("updateTrip - src/services/trips.service.js");
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
  console.log("deleteTrip - src/services/trips.service.js");
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
  console.log("approveTrip - src/services/trips.service.js");
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

    // אישור הטיול חסום אם חסרים מסמכי חובה בתיק הטיול
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
    // console.log(err, "this is err in approve trip service");
    log.warn(`error: ${err.message}, from approveTrip in trips.service`);
    throw err;
  }
}
export async function addStaff(tripId, staffAssignments) {
  console.log("addStaff - src/services/trips.service.js");
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
  console.log("getAllStaff - src/services/trips.service.js");
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
  console.log("deleteStaff - src/services/trips.service.js");
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
  console.log("addExternalStaff - src/services/trips.service.js");
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
  console.log("deleteExternalStaff - src/services/trips.service.js");
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
  console.log("closeTrip - src/services/trips.service.js");
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
  console.log("setPostEdit - src/services/trips.service.js");
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
