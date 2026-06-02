// users.routes.js

import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import log from "../loggers/file.logger.js";
import {
  getUserById,
  updateProfile,
  changePassword,
  addUser,
} from "../controllers/users.controller.js";
const router = express.Router();

router.get("/", requireRole("principal"), (req, res) => {
  log.info("in get all users");
  console.log("in users router");
  res.send("users: get all users");
});
router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  getUserById,
);
// router.put(
//   "/:id",
//   requireRole("principal", "coordinator", "trip leader", "teacher"),
//   changePassword,
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
