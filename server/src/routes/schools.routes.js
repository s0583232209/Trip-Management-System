
import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
import { getSchool, updateSchool } from "../controllers/schools.controller.js";
const router = express.Router();

router.get(
  "/me",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  getSchool,
);

router.put("/me", requireRole("principal"), updateSchool);

export default router;
