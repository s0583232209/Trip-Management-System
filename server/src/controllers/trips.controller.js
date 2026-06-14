//this is API layer
import log from "../loggers/file.logger.js";
import * as tripsService from "../services/trips.service.js";
import { createParentToken } from "../services/auth.service.js";
export async function getAllTrips(req, res, next) {
  console.log("getAllTrips - src/controllers/trips.controller.js");
  try {
    const trips = await tripsService.getAllTrips(req.user.userId);
    // console.log("trips controller after getting all trips = ", trips);
    res.status(200).json(trips);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    err.status = err.status || 500;
    err.message = "Failed to get trips";
    next(err);
  }
}

export async function getById(req, res, next) {
  console.log("getById - src/controllers/trips.controller.js");
  try {
    const trip = await tripsService.getById(req.params.id, req.user.userId);
    log.info(`the trip with id ${req.params.id} returned successfully`);
    // console.log(trip, "this is ther trip");
    res.status(200).json(trip);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    err.status = err.status || 500;
    err.message = "Failed to get trip by id";
    next(err);
  }
}

export async function createTrip(req, res, next) {
  console.log("createTrip - src/controllers/trips.controller.js");
  try {
    const newTrip = await tripsService.addTrip(req.body);
    log.info(`new trip added successfully`);
    res.status(201).json(newTrip);
  } catch (err) {
    log.warn(`creating trip failed`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function updateTrip(req, res, next) {
  console.log("updateTrip - src/controllers/trips.controller.js");
  try {
    log.info(`updateTrip body: ${JSON.stringify(req.body)}`);
    const updatedTrip = await tripsService.updateTrip({
      ...req.body,
      tripId: req.params.id,
    });
    log.info(`update trip successfully, trip id: ${req.params.id}`);
    res.status(200).json(updatedTrip);
  } catch (err) {
    log.warn(`updating trip failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function deleteTrip(req, res, next) {
  console.log("deleteTrip - src/controllers/trips.controller.js");
  try {
    const response = await tripsService.deleteTrip(req.params.id);
    log.info(`trip with id: ${req.params.id} deleted successfully`);
    res.status(201).json("Trip deleted successfully");
  } catch (err) {
    log.warn(`deleting trip failed, from deleteTrip in trips.controller`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function approveTrip(req, res, next) {
  console.log("approveTrip - src/controllers/trips.controller.js");
  try {
    const trip = await tripsService.approveTrip(req.params.id);
    // console.log(trip);
    log.info(`trip with id: ${req.params.id} approved successfully`);
    res.status(201).json(trip);
  } catch (err) {
    log.warn(`approving trip failed: ${err.message}`);
    next(err);
  }
}
export async function addStaff(req, res, next) {
  console.log("addStaff - src/controllers/trips.controller.js");
  try {
    await tripsService.addStaff(req.params.id, req.body.staffAssignments);
    log.info(`staff added to trip: ${req.params.id}`);
    res.status(201).json({ message: "Staff added successfully" });
  } catch (err) {
    log.warn(`adding staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function getAllStaff(req, res, next) {
  console.log("getAllStaff - src/controllers/trips.controller.js");
  try {
    const staff = await tripsService.getAllStaff(req.params.id);
    res.status(201).json(staff);
  } catch (err) {
    log.warn(`getting staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function deleteStaff(req, res, next) {
  console.log("deleteStaff - src/controllers/trips.controller.js");
  try {
    await tripsService.deleteStaff(req.params.id, req.params.userId);
    log.info(`staff ${req.params.userId} removed from trip: ${req.params.id}`);
    res.status(201).json({ message: "Staff deleted successfully" });
  } catch (err) {
    log.warn(`deleting staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function addExternalStaff(req, res, next) {
  console.log("addExternalStaff - src/controllers/trips.controller.js");
  try {
    await tripsService.addExternalStaff(req.params.id, req.body);
    res.status(201).json({ message: "External staff added successfully" });
  } catch (err) {
    log.warn(`adding external staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function deleteExternalStaff(req, res, next) {
  console.log("deleteExternalStaff - src/controllers/trips.controller.js");
  try {
    await tripsService.deleteExternalStaff(req.params.id, req.params.staffId);
    log.info(
      `external staff ${req.params.staffId} removed from trip: ${req.params.id}`,
    );
    res.status(201).json({ message: "External staff deleted successfully" });
  } catch (err) {
    log.warn(`deleting external staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function closeTrip(req, res, next) {
  console.log("closeTrip - src/controllers/trips.controller.js");
  try {
    await tripsService.closeTrip(req.params.id);
    res.status(200).json({ message: "trip closed successfully" });
  } catch (err) {
    next(err);
  }
}

export async function setPostEdit(req, res, next) {
  console.log("setPostEdit - src/controllers/trips.controller.js");
  try {
    await tripsService.setPostEdit(req.params.id, req.body.note);
    res.status(200).json({ message: "הטיול נפתח לעריכה בדיעבד" });
  } catch (err) {
    next(err);
  }
}
