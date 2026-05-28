// auth.routes.js

import express from "express";

const router = express.Router();

router.post("/register", (req, res) => {
  res.send("auth: register");
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
