import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import requireTripDay from "../middlewares/tripDay.middleware.js";
import * as tripsController from "../controllers/trips.controller.js";
const router = express.Router({ mergeParams: true });

// צפייה בטיולים — כולם
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  tripsController.getAllTrips,
);

// יצירת טיול — מנהל ורכז טיולים
router.post(
  "/",
  requireRole("principal", "coordinator"),
  tripsController.createTrip,
);

// צפייה בטיול בודד — כולם
router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  tripsController.getById,
);

// מחיקת טיול — מנהל ורכז טיולים
router.delete(
  "/:id",
  requireRole("principal", "coordinator"),
  tripsController.deleteTrip,
);

// עדכון מסלול — מנהל, רכז; אחראי טיול רק ביום הטיול
router.put("/:id", requireRole("principal", "coordinator", "trip leader"), (req, res, next) => {
  const role = req.user?.role;
  if (role === "principal" || role === "coordinator") return next();
  return requireTripDay(req, res, next);
}, tripsController.updateTrip);

// אישור טיול — מנהל ורכז טיולים
router.put(
  "/:id/approve",
  requireRole("principal", "coordinator"),
  tripsController.approveTrip,
);

// סגירת טיול — מנהל ורכז טיולים
router.put(
  "/:id/close",
  requireRole("principal", "coordinator"),
  (req, res) => {
    res.send("trips: put, close trip " + req.params.id);
  },
);

// צפייה בצוות טיול — מנהל, רכז, אחראי טיול, מורה
router.get(
  "/:id/staff",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  (req, res) => {
    res.send("trips: get, staff");
  },
);

// הכנסת נתוני מלווים — מנהל ורכז טיולים
router.post(
  "/:id/staff",
  requireRole("principal", "coordinator"),
  tripsController.addStaff,
);

export default router;
