// emergency.routes.js
// הרשאות פתיחה/סגירה של חירום (מינורי/קריטי) נבדקות ב-emergencies.service.js
// לפי trips.trip_leader_id (אחראי הטיול הספציפי) ו/או staff_trip+role 'teacher',
// כדי שההרשאה תהיה צמודה לטיול הספציפי ולא לתפקיד גלובלי של המשתמש.
import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
import requireTripDay from "../middlewares/tripDay.middleware.js";
import * as emergenciesController from "../controllers/emergencies.controller.js";

const router = express.Router({ mergeParams: true });

// קריאת חירומים — כולם
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  emergenciesController.getByTripId,
);

// פתיחת חירום מינורי — אחראי הטיול הספציפי או מורה המשובץ לטיול, ביום הטיול בלבד
router.post(
  "/minor",
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

// פתיחה כללית — ההרשאה נבדקת ב-service לפי סוג האירוע
router.post(
  "/",
  emergenciesController.create,
);

// עדכון חירום
router.put(
  "/:emergencyId",
  emergenciesController.update,
);

// סגירת חירום מינורי — אחראי הטיול הספציפי או מורה המשובץ לטיול, ביום הטיול בלבד
router.put(
  "/:emergencyId/close/minor",
  emergenciesController.update,
);

// סגירת חירום קריטי — אחראי הטיול הספציפי ביום הטיול
router.put(
  "/:emergencyId/close/critical",
  requireTripDay,
  emergenciesController.update,
);

// סגירה כללית — ההרשאה נבדקת ב-service לפי סוג האירוע
router.put(
  "/:emergencyId/close",
  emergenciesController.update,
);

// מחיקת חירום — מנהל בלבד
router.delete(
  "/:emergencyId",
  requireRole("principal"),
  emergenciesController.remove,
);

export default router;
