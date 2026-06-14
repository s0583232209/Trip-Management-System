import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
import requireTripDay from "../middlewares/tripDay.middleware.js";
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
  "/example-kit/templates",
  requireRole("principal", "coordinator"),
  tripsController.getExampleKitTemplates,
);

router.get(
  "/example-kit/templates/files",
  requireRole("principal", "coordinator"),
  tripsController.getExampleKitTemplateFiles,
);

router.get(
  "/example-kit/templates/files/:fileName",
  requireRole("principal", "coordinator"),
  tripsController.downloadExampleKitTemplateFile,
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
  (req, res, next) => {
    const userRoles = req.user?.roles || (req.user?.role ? [req.user.role] : []);
    if (userRoles.includes("principal") || userRoles.includes("coordinator")) return next();
    return requireTripDay(req, res, next);
  },
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
 tripsController.closeTrip,
);

router.put(
  "/:id/post-edit",
  requireRole("principal"),
  tripsController.setPostEdit,
);

router.get(
  "/:id/classes",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  tripsController.getTripClasses,
);
router.get(
  "/:id/school-classes",
  requireRole("principal", "coordinator"),
  tripsController.getSchoolClasses,
);
router.put(
  "/:id/classes",
  requireRole("principal", "coordinator"),
  tripsController.setTripClasses,
);

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
router.post(
  "/:id/external-staff",
  requireRole("principal", "coordinator"),
  tripsController.addExternalStaff,
);
router.delete(
  "/:id/external-staff/:staffId",
  requireRole("principal", "coordinator"),
  tripsController.deleteExternalStaff,
);
export default router;
