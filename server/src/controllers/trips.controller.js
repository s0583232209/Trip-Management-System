//this is API layer
import log from "../loggers/file.logger.js";
import * as tripsService from "../services/trips.service.js";
import { createParentToken } from "../services/auth.service.js";
export async function getAllTrips(req, res) {
  try {
    const trips = await tripsService.getAllTrips(req.user.userId);
    console.log("trips controller after getting all trips = ", trips);
    res.status(200).json(trips);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    res.status(500).json({ message: "Failed to get trips" });
  }
}

export async function getById(req, res) {
  try {
    const trip = await tripsService.getById(req.params.id, req.user.userId);
    log.info(`the trip with id ${req.params.id} returned successfully`);
    console.log(trip, "this is ther trip");
    res.status(200).json(trip);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    res.status(500).json({ message: "Failed to get trip by id" });
  }
}

export async function createTrip(req, res) {
  try {
    const newTrip = await tripsService.addTrip(req.body);
    log.info(`new trip added successfully`);
    res.status(201).json(newTrip);
  } catch (err) {
    log.warn(`creating trip failed`);
    res.status(500).json(err.message);
  }
}
export async function updateTrip(req, res) {
  try {
    const updatedTrip = await tripsService.updateTrip(req.body);
    log.info(`update trip successfully, trip id: ${updateTrip.id}`);
    res.status(201).json(updatedTrip);
  } catch (err) {
    log.warn(`updating trip failed`);
    res.status(500).json("Updating failed");
  }
}
export async function deleteTrip(req, res) {
  try {
    const response = await tripsService.deleteTrip(req.params.id);
    log.info(`trip with id: ${req.params.id} deleted successfully`);
    res.status(201).json("Trip deleted successfully");
  } catch (err) {
    log.warn(`deleting trip failed, from deleteTrip in trips.controller`);
    res.status(500).json(err.message);
  }
}
export async function approveTrip(req, res) {
  try {
    const trip = await tripsService.approveTrip(req.params.id);
    console.log(trip);
    log.info(`trip with id: ${req.params.id} approved successfully`);
    res.status(201).json(trip);
  } catch (err) {
    log.warn(`approving trip failed`);
    res.status(500).json("Approving failed");
  }
}
export async function addStaff(req, res) {
  try {
    await tripsService.addStaff(req.params.id, req.body.nationalIds);
    log.info(`staff added to trip: ${req.params.id}`);
    res.status(201).json({ message: "Staff added successfully" });
  } catch (err) {
    log.warn(`adding staff failed: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
}
