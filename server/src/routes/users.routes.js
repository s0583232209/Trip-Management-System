// users.routes.js

import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import log from "../loggers/file.logger.js";
import {
  getUserById,
  updateProfile,
  changePassword,
  addUser,
  getAllUsersBySchool,
} from "../controllers/users.controller.js";
const router = express.Router();

router.get("/", requireRole("principal", "coordinator"), getAllUsersBySchool);
router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  getUserById,
); //   changePassword,
// );

router.delete("/:id", requireRole("principal"), (req, res) => {
  res.send("users: delete user");
});
router.post("/", requireRole("principal"), addUser);
router.post(
  "/:id/change-password",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  changePassword,
);
export default router;
