import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
import requireTripDay from "../middlewares/tripDay.middleware.js";
import requireTripStaff from "../middlewares/requireTripStaff.middleware.js";
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

// תבניות ריקות לדוגמה לעמוד "דוגמה ומדריך למילוי אוגדן ותיק טיול" — מנהל ורכז בלבד, על פני כל בתי הספר
router.get(
  "/example-kit/templates",
  requireRole("principal", "coordinator"),
  tripsController.getExampleKitTemplates,
);

// רשימת כל הקבצים הקיימים בתיקיית התבניות לדוגמה — מנהל ורכז בלבד, על פני כל בתי הספר
router.get(
  "/example-kit/templates/files",
  requireRole("principal", "coordinator"),
  tripsController.getExampleKitTemplateFiles,
);

// הורדת קובץ בודד מתיקיית התבניות לדוגמה — מנהל ורכז בלבד, על פני כל בתי הספר
router.get(
  "/example-kit/templates/files/:fileName",
  requireRole("principal", "coordinator"),
  tripsController.downloadExampleKitTemplateFile,
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
router.put(
  "/:id",
  requireRole("principal", "coordinator", "trip leader"),
  requireTripStaff,
  (req, res, next) => {
    const userRoles = req.user?.roles || (req.user?.role ? [req.user.role] : []);
    if (userRoles.includes("principal") || userRoles.includes("coordinator")) return next();
    return requireTripDay(req, res, next);
  },
  tripsController.updateTrip,
);

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
 tripsController.closeTrip,
);

// פתיחת עריכה בדיעבד — מנהל בלבד
router.put(
  "/:id/post-edit",
  requireRole("principal"),
  tripsController.setPostEdit,
);

// צפייה בצוות טיול — מנהל, רכז, אחראי טיול, מורה
router.get(
  "/:id/staff",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  tripsController.getAllStaff,
);

// הכנסת נתוני מלווים — מנהל ורכז טיולים
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
