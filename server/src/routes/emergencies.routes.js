// emergency.routes.js
import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import requireTripDay from "../middlewares/tripDay.middleware.js";
import * as emergenciesController from "../controllers/emergencies.controller.js";

const router = express.Router({ mergeParams: true });

// קריאת חירומים — כולם
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  emergenciesController.getByTripId,
);

// פתיחת חירום מינורי — אחראי טיול ומורה
router.post(
  "/minor",
  requireRole("trip leader", "teacher"),
  (req, res, next) => {
    req.body.emergencyTypeId = 1; // minor
    next();
  },
  emergenciesController.create,
);

// פתיחת חירום קריטי — אחראי טיול ביום הטיול בלבד
router.post(
  "/critical",
  requireTripDay,
  (req, res, next) => {
    req.body.emergencyTypeId = 2; // critical
    next();
  },
  emergenciesController.create,
);

// פתיחה כללית (עם emergencyTypeId בבקשה) — אחראי ומורה; קריטי יבדק בקונטרולר
router.post(
  "/",
  requireRole("trip leader", "teacher"),
  emergenciesController.create,
);

// עדכון חירום — אחראי טיול ומורה
router.put(
  "/:emergencyId",
  requireRole("trip leader", "teacher"),
  emergenciesController.update,
);

// סגירת חירום מינורי — אחראי טיול ומורה
router.put(
  "/:emergencyId/close/minor",
  requireRole("trip leader", "teacher"),
  emergenciesController.update,
);

// סגירת חירום קריטי — אחראי טיול ביום הטיול
router.put(
  "/:emergencyId/close/critical",
  requireTripDay,
  emergenciesController.update,
);

// סגירה כללית (לתאימות לאחור) — אחראי טיול ומורה
router.put(
  "/:emergencyId/close",
  requireRole("trip leader", "teacher"),
  emergenciesController.update,
);

// מחיקת חירום — מנהל בלבד
router.delete(
  "/:emergencyId",
  requireRole("principal"),
  emergenciesController.remove,
);

export default router;
