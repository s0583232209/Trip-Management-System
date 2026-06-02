// media.routes.js

import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import * as mediaController from "../controllers/media.controller.js";
const router = express.Router({ mergeParams: true });

router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher", "parent"),
  mediaController.getAllMedia,
);

router.post("/", requireRole("trip leader", "teacher"), () => {
  return "media: upload media";
});

router.delete(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  () => {
    return "media: delete media";
  },
);

export default router;
