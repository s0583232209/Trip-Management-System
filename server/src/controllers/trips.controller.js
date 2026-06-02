//this is API layer
import log from "../loggers/file.logger.js";
import * as tripsService from "../services/trips.service.js";
export async function getAllTrips(req, res) {
  try {
    const trips = await tripsService.getAllTrips(req.user.userId);
    res.status(200).json(trips);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    res.status(500).json({ message: "Failed to get trips" });
  }
}
