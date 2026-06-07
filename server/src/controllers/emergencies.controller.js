import * as emergenciesService from "../services/emergencies.service.js";
import log from "../loggers/file.logger.js";

export async function getByTripId(req, res) {
  try {
    const tripId = req.params.id; // מגיע מתוך /api/trips/:id
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
      tripId: req.params.id,            // נלקח אוטומטית מהנתיב ב-server.js
      openedBy: req.user?.userId || 0   // נלקח מהטוקן המאומת (auth.middleware)
    };
    const newEmergency =
      await emergenciesService.createEmergency(emergencyData);
    res
      .status(201)
      .json({
        message: "Emergency created successfully",
        emergency: newEmergency,
      });
  } catch (error) {
    log.error(`EmergenciesController - create error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function update(req, res) {
  try {
    const emergencyId = req.params.emergencyId; // משתמש בפרמטר המעודכן שהגדרנו בראוט
    const emergencyData = req.body;
    await emergenciesService.updateEmergency(emergencyId, emergencyData);
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
