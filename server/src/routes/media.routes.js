// media.routes.js
import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import * as mediaController from "../controllers/media.controller.js";
const router = express.Router({ mergeParams: true });

// צפייה במדיה — מנהל, רכז, אחראי, מורה
router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  mediaController.getAllMedia,
);

// העלאת תיעוד (תמונות/וידאו/אודיו) — מנהל, רכז, אחראי, מורה
router.post(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  (req, res) => {
    res.send("media: upload media");
  },
);

// מחיקת מדיה — מנהל ורכז
router.delete(
  "/:id",
  requireRole("principal", "coordinator"),
  (req, res) => {
    res.send("media: delete media");
  },
);

export default router;
