import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
import * as classesController from "../controllers/classes.controller.js";
const router = express.Router();

router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  classesController.getAllClasses,
);

router.post(
  "/",
  requireRole("principal", "coordinator"),
  classesController.addClass,
);

router.put(
  "/:id",
  requireRole("principal", "coordinator"),
  classesController.updateClass,
);

router.delete(
  "/:id",
  requireRole("principal", "coordinator"),
  classesController.deleteClass,
);

export default router;
