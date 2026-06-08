// files.routes.js
import * as filesController from "../controllers/files.controller.js";
import upload from "../middlewares/upload.middleware.js";
import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
const router = express.Router({ mergeParams: true });

// router.get(
//   "/",
//   requireRole("principal", "coordinator", "trip leader", "teacher"),
//   () => {
//     return "files: get all";
//   },
// );

router.post(
  "/",
  requireRole("principal", "coordinator"),
  upload.single("file"),
  filesController.uploadFile,
  () => console.log("in the router"),
);

router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader"),
  filesController.getFile,
);

router.delete("/:id", requireRole("principal", "coordinator"), () => {
  return "files: delete by id";
});

export default router;
