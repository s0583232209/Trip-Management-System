// media.routes.js

import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher", "parent"),
  res.message("in get all media"),
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
