import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import * as tripsController from "../controllers/trips.controller.js";
const router = express.Router({ mergeParams: true });
router.get(
  "/",
  requireRole("principal", "coordinator"),
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
router.delete("/:id", requireRole("principal", "coordinator"), (req, res) => {
  res.send("trips: delete by id");
});
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
    res.send("trips: put, close trip" + id);
  },
);
router.get(
  "/:id/staff",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  (req, res) => {
    res.send("trips: get, staff");
  },
);
router.post(
  "/:id/staff",
  requireRole("principal", "coordinator"),
  tripsController.addStaff,
);
export default router;
