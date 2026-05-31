// files.routes.js

import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
const router = express.Router({ mergeParams: true });

router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  () => {
    return "files: get all";
  },
);

router.post("/", requireRole("principal", "coordinator"), () => {
  return "files: upload file";
});

router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader"),
  () => {
    return "files: get by id";
  },
);

router.delete("/:id", requireRole("principal", "coordinator"), () => {
  return "files: delete by id";
});

export default router;
