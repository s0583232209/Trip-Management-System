// files.routes.js
// כל הנתיבים כאן ממוזגים תחת /api/trips/:id/files (ראו server.js),
// כך ש-req.params.id הוא מזהה הטיול (אלא אם מוגדר :id ספציפי בנתיב עצמו, שאז הוא מזהה הקובץ).
import * as filesController from "../controllers/files.controller.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";
import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
const router = express.Router({ mergeParams: true });

// קבלת רשימת מסמכי תיק הטיול — מנהל, רכז, אחראי, מורה
router.get(
  "/kit",
  requireRole("principal", "coordinator", "trip leader"),
  filesController.getKit,
);

// העלאה/החלפה של מסמך בתיק הטיול — מנהל ורכז טיולים
// upload.single("file") הוא מידלוור multer שמטפל בקובץ שהועלה (multipart/form-data)
router.post(
  "/kit",
  requireRole("principal", "coordinator"),
  uploadSingle("file"),
  filesController.addToKit,
);

// קבלת רשימת כל הקבצים שהועלו לטיול (כולל קבצים נוספים שאינם בתיק) — מנהל, רכז, אחראי, מורה
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader"),
  filesController.getAllFiles,
);

// העלאת קובץ "רגיל" לטיול — מנהל ורכז טיולים
router.post(
  "/",
  requireRole("principal", "coordinator"),
  uploadSingle("file"),
  filesController.uploadFile,
);

// הורדת/פתיחת קובץ — מנהל, רכז, אחראי, מורה
router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader"),
  filesController.getFile,
);

// מחיקת קובץ מתיק טיול — מנהל ורכז טיולים
router.delete(
  "/:id",
  requireRole("principal", "coordinator"),
  filesController.deleteFile,
);

export default router;
