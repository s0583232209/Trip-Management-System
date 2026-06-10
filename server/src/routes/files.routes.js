// files.routes.js
import * as filesController from "../controllers/files.controller.js";
import upload from "../middlewares/upload.middleware.js";
import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
const router = express.Router({ mergeParams: true });

// צפייה ברשימת קבצים — מנהל, רכז, אחראי, מורה
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  filesController.getAllFiles,
);

// העלאת קובץ לתיק טיול — מנהל ורכז טיולים
router.post(
  "/",
  requireRole("principal", "coordinator"),
  upload.single("file"),
  filesController.uploadFile,
);

// הורדת/פתיחת קובץ — מנהל, רכז, אחראי, מורה
router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  filesController.getFile,
);

// מחיקת קובץ מתיק טיול — מנהל ורכז טיולים
router.delete(
  "/:id",
  requireRole("principal", "coordinator"),
  (req, res) => {
    res.send("files: delete by id");
  },
);

export default router;
