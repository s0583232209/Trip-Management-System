import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
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

// עדכון כיתה — מנהל ורכז טיולים
router.put(
  "/:id",
  requireRole("principal", "coordinator"),
  classesController.updateClass,
);

// מחיקת כיתה — מנהל ורכז טיולים
router.delete(
  "/:id",
  requireRole("principal", "coordinator"),
  classesController.deleteClass,
);

export default router;
