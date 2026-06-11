import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import * as classesController from "../controllers/classes.controller.js";
const router = express.Router();

// צפייה ברשימת הכיתות — כולם
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  classesController.getAllClasses,
);

// הוספת כיתה חדשה — מנהל ורכז טיולים
router.post(
  "/",
  requireRole("principal", "coordinator"),
  classesController.addClass,
);

export default router;
