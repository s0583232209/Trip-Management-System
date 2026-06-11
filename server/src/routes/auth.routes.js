// auth.routes.js

import express from "express";
import {
  register,
  logout,
  login,
  refreshToken,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/refresh", refreshToken);
router.post("/login", login);

router.post("/logout", logout);

export default router;
