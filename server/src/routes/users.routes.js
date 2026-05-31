// users.routes.js

import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
import log from "../loggers/file.logger.js";

const router = express.Router();

router.get("/", requireRole("principal"), (req, res) => {
  log.info("in get all users");
  console.log("in users router");
  res.send("users: get all users");
});
router.get("/:id", requireRole("principal"), (req, res) => {
  res.send("users: get user by id");
});
router.put("/:id", requireRole("principal"), (req, res) => {
  res.send("users: update user");
});
router.delete("/:id", requireRole("principal"), (req, res) => {
  res.send("users: delete user");
});
router.post("/", requireRole("principal"), (req, res) => {
  res.send("users: post add user");
});
export default router;
