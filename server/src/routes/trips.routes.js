import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import * as tripsController from "../controllers/trips.controller.js";
const router = express.Router({ mergeParams: true });
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  tripsController.getAllTrips,
);
router.post(
  "/",
  requireRole("principal", "coordinator"),
  tripsController.createTrip,
);
router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  tripsController.getById,
);
router.delete(
  "/:id",
  requireRole("principal", "coordinator"),
  tripsController.deleteTrip,
);
router.put(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  tripsController.updateTrip,
);
router.put(
  "/:id/approve",
  requireRole("principal", "coordinator"),
  tripsController.approveTrip,
);
router.put(
  "/:id/close",
  requireRole("principal", "coordinator"),
  (req, res) => {
    res.send("trips: put, close trip" + id);//req.params.id ?
  },
)
router.get(
  "/:id/staff",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  tripsController.getAllStaff,
);
router.post(
  "/:id/staff",
  requireRole("principal", "coordinator"),
  tripsController.addStaff,
);
router.delete(
  "/:id/staff/:userId",
  requireRole("principal", "coordinator"),
  tripsController.deleteStaff,
);
router.post("/:id/external-staff",
  requireRole("principal", "coordinator"),
  tripsController.addExternalStaff,
)
export default router;
