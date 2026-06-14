
import express from "express";
import requireRole from "../middlewares/roleGuard.middleware.js";
import log from "../loggers/file.logger.js";
import {
  getUserById,
  updateProfile,
  changePassword,
  addUser,
  getAllUsersBySchool,
  deleteUser,
  updateUserRole,
  addUserRole,
  removeUserRole,
} from "../controllers/users.controller.js";
const router = express.Router();

router.get("/", requireRole("principal", "coordinator"), getAllUsersBySchool);
router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  getUserById,
);

router.put(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  updateProfile,
);

router.delete("/:id", requireRole("principal"), deleteUser);
router.put("/:id/role", requireRole("principal"), updateUserRole);
router.post("/:id/roles", requireRole("principal"), addUserRole);
router.delete("/:id/roles/:role", requireRole("principal"), removeUserRole);
router.post("/", requireRole("principal"), addUser);
router.post(
  "/:id/change-password",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  changePassword,
);
export default router;
