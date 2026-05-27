// users.routes.js

import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("users: get all users");
});

router.get("/:id", (req, res) => {
  res.send("users: get user by id");
});

router.put("/:id", (req, res) => {
  res.send("users: update user");
});

router.delete("/:id", (req, res) => {
  res.send("users: delete user");
});

export default router;
