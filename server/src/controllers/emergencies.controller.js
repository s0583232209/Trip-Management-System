import * as emergenciesService from "../services/emergencies.service.js";
import log from "../loggers/file.logger.js";
import { io } from "../../server.js"; // ← שורה חדשה

export async function getByTripId(req, res) {
  try {
    const tripId = req.params.id || req.params.tripId;
    const emergencies = await emergenciesService.getEmergenciesByTripId(tripId);
    res.status(200).json(emergencies);
  } catch (error) {
    log.error(`EmergenciesController - getByTripId error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function create(req, res) {
  try {
    const emergencyData = {
      ...req.body,
      tripId: req.params.id || req.params.tripId,
      openedBy: req.user?.userId || null,
    };

    // הגנה נוספת בצד שרת: חירום קריטי (typeId=2) רק לאחראי טיול ביום הטיול
    if (parseInt(emergencyData.emergencyTypeId) === 2) {
      if (req.user?.role !== "trip leader") {
        return res
          .status(403)
          .json({ message: "חירום קריטי מותר לאחראי טיול ביום הטיול בלבד" });
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
    res.status(error.status || 500).json({ message: error.message });
  }
}

export async function update(req, res) {
  try {
    const tripId = req.params.id || req.params.tripId;
    const newEmergency = await emergenciesService.updateEmergency(
      emergencyId,
      emergencyData,
    );
    io.to(`trip-${tripId}`).emit("emergency-alert", {
      emergency: newEmergency,
      timestamp: new Date().toISOString(),
    });
    res.status(200).json({ message: "Emergency updated successfully" });
  } catch (error) {
    log.error(`EmergenciesController - update error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function remove(req, res) {
  try {
    const emergencyId = req.params.emergencyId;
    await emergenciesService.deleteEmergency(emergencyId);
    res.status(200).json({ message: "Emergency deleted successfully" });
  } catch (error) {
    log.error(`EmergenciesController - remove error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
}
