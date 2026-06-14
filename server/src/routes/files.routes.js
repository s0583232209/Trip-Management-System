import * as filesController from "../controllers/files.controller.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";
import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
const router = express.Router({ mergeParams: true });

router.get(
  "/kit",
  requireRole("principal", "coordinator", "trip leader"),
  filesController.getKit,
);

router.post(
  "/kit",
  requireRole("principal", "coordinator"),
  uploadSingle("file"),
  filesController.addToKit,
);

router.get(
  "/",
  requireRole("principal", "coordinator", "trip leader"),
  filesController.getAllFiles,
);

router.post(
  "/",
  requireRole("principal", "coordinator"),
  uploadSingle("file"),
  filesController.uploadFile,
);

router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader"),
  filesController.getFile,
);

router.delete(
  "/:id",
  requireRole("principal", "coordinator"),
  filesController.deleteFile,
);

export default router;
