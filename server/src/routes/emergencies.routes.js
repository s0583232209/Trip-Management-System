import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
import requireTripDay from "../middlewares/tripDay.middleware.js";
import * as emergenciesController from "../controllers/emergencies.controller.js";

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  emergenciesController.getByTripId,
);

router.post(
  "/minor",
  requireTripDay,
  (req, res, next) => {
    req.body.emergencyTypeId = 1;
    next();
  },
  emergenciesController.create,
);

router.post(
  "/critical",
  requireTripDay,
  (req, res, next) => {
    req.body.emergencyTypeId = 2;
    next();
  },
  emergenciesController.create,
);

router.post(
  "/",
  emergenciesController.create,
);

router.put(
  "/:emergencyId",
  emergenciesController.update,
);

router.put(
  "/:emergencyId/close/minor",
  emergenciesController.update,
);

router.put(
  "/:emergencyId/close/critical",
  requireTripDay,
  emergenciesController.update,
);

router.put(
  "/:emergencyId/close",
  emergenciesController.update,
);

router.delete(
  "/:emergencyId",
  requireRole("principal"),
  emergenciesController.remove,
);

export default router;
