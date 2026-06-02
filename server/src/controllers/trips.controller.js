//this is API layer
import log from "../loggers/file.logger.js";
import * as tripsService from "../services/trips.service.js";
import { createParentToken } from "../services/auth.service.js";
export async function getAllTrips(req, res) {
  try {
    const trips = await tripsService.getAllTrips(req.user.userId);
    res.status(200).json(trips);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    res.status(500).json({ message: "Failed to get trips" });
  }
}

export async function getById(req, res) {
  try {
    const trip = await tripsService.getById(req.params.id, req.user.userId);
    log.info(`the trip with id ${tripId} returned successfully`);
    res.status(200).json(trip);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    res.status(500).json({ message: "Failed to get trip by id" });
  }
}
export async function addTrip(req, res) {
  try {
  } catch (err) {}
}
export async function createTrip(req, res) {
  try {
    const newTrip = await tripsService.addTrip(req.body);
    log.info(`new trip added successfully`);
    res.status(201).json(newTrip);
  } catch (err) {}
}
