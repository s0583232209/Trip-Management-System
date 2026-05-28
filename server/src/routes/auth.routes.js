// auth.routes.js

import express from "express";
import { register } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", (req, res) => {
  console.log("in route of register");
  register(req, res);
});
router.post("/refresh", (req, res) => {
  res.send("auth: refresh token");
});
router.post("/login", (req, res) => {
  res.send("auth: login");
});

router.post("/logout", (req, res) => {
  res.send("auth: logout");
});

export default router;
