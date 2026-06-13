// emergency.routes.js
import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
import requireTripDay from "../middlewares/tripDay.middleware.js";
import requireTripStaff from "../middlewares/requireTripStaff.middleware.js";
import * as emergenciesController from "../controllers/emergencies.controller.js";

const router = express.Router({ mergeParams: true });

// קריאת חירומים — כולם
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  emergenciesController.getByTripId,
);

// פתיחת חירום מינורי — אחראי טיול ומורה השייכים לטיול
router.post(
  "/minor",
  requireRole("trip leader", "teacher"),
  requireTripStaff,
  (req, res, next) => {
    req.body.emergencyTypeId = 1;
    next();
  },
  emergenciesController.create,
);

// פתיחת חירום קריטי — אחראי הטיול הספציפי ביום הטיול בלבד
router.post(
  "/critical",
  requireTripDay,
  (req, res, next) => {
    req.body.emergencyTypeId = 2;
    next();
  },
  emergenciesController.create,
);

// פתיחה כללית — אחראי ומורה השייכים לטיול
router.post(
  "/",
  requireRole("trip leader", "teacher"),
  requireTripStaff,
  emergenciesController.create,
);

// עדכון חירום — אחראי טיול ומורה השייכים לטיול
router.put(
  "/:emergencyId",
  requireRole("trip leader", "teacher"),
  requireTripStaff,
  emergenciesController.update,
);

// סגירת חירום מינורי — אחראי טיול ומורה השייכים לטיול
router.put(
  "/:emergencyId/close/minor",
  requireRole("trip leader", "teacher"),
  requireTripStaff,
  emergenciesController.update,
);

// סגירת חירום קריטי — אחראי הטיול הספציפי ביום הטיול
router.put(
  "/:emergencyId/close/critical",
  requireTripDay,
  emergenciesController.update,
);

// סגירה כללית — אחראי ומורה השייכים לטיול
router.put(
  "/:emergencyId/close",
  requireRole("trip leader", "teacher"),
  requireTripStaff,
  emergenciesController.update,
);

// מחיקת חירום — מנהל בלבד
router.delete(
  "/:emergencyId",
  requireRole("principal"),
  emergenciesController.remove,
);

export default router;
