// emergency.routes.js
import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import * as emergenciesController from "../controllers/emergencies.controller.js";

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  emergenciesController.getByTripId,
);

router.post(
  "/",
  requireRole("trip leader", "teacher"),
  emergenciesController.create,
);

router.put(
  "/:emergencyId",
  requireRole("trip leader", "teacher"),
  emergenciesController.update,
);

router.put(
  "/:emergencyId/close",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  emergenciesController.update,
);

router.delete(
  "/:emergencyId",
  requireRole("principal"),
  emergenciesController.remove,
);

export default router;
