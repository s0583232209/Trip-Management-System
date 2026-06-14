import * as emergenciesService from "../services/emergencies.service.js";
import log from "../loggers/file.logger.js";
import { io } from "../../server.js"; 

export async function getByTripId(req, res, next) {
  try {
    const tripId = req.params.id || req.params.tripId;
    const emergencies = await emergenciesService.getEmergenciesByTripId(tripId);
    res.status(200).json(emergencies);
  } catch (error) {
    log.error(`EmergenciesController - getByTripId error: ${error.message}`);
    error.status = error.status || 500;
    error.message = "Internal server error";
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const emergencyData = {
      ...req.body,
      tripId: req.params.id || req.params.tripId,
      openedBy: req.user?.userId || null,
    };

    if (parseInt(emergencyData.emergencyTypeId) === 2) {
      const isTripLeader = await userHasRole(req.user?.userId, ["trip leader"]);
      if (!isTripLeader) {
        const error = new Error("חירום קריטי מותר לאחראי טיול ביום הטיול בלבד");
        error.status = 403;
        return next(error);
      }
    }

    const newEmergency =
      await emergenciesService.createEmergency(emergencyData);
    const tripId = emergencyData.tripId;
    io.to(`trip-${tripId}`).emit("emergency-alert", {
      emergency: newEmergency,
      timestamp: new Date().toISOString(),
    });
    res.status(201).json({
      message: "Emergency created successfully",
      emergency: newEmergency,
    });
  } catch (error) {
    log.error(`EmergenciesController - create error: ${error.message}`);
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const tripId = req.params.id || req.params.tripId;
    const { emergencyId } = req.params;
    const updatedEmergency = await emergenciesService.updateEmergency(
      emergencyId,
      req.body,
      tripId,
      req.user?.userId,
    );
    if (req.body.status === 2 || parseInt(req.body.status) === 2) {
      io.to(`trip-${tripId}`).emit("emergency-closed", {
        emergencyId: parseInt(emergencyId),
        closedAt: new Date().toISOString(),
      });
    }
    res.status(200).json({ message: "Emergency updated successfully" });
  } catch (error) {
    log.error(`EmergenciesController - update error: ${error.message}`);

    error.status = error.status || 500;
    error.message = "Internal server error";
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const emergencyId = req.params.emergencyId;
    await emergenciesService.deleteEmergency(emergencyId);
    res.status(200).json({ message: "Emergency deleted successfully" });
  } catch (error) {
    log.error(`EmergenciesController - remove error: ${error.message}`);
    error.status = error.status || 500;
    error.message = "Internal server error";
    next(error);
  }
}
