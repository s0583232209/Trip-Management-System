// emergency.routes.js

import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", () => {
  return "emergency: get all emergencies";
});

router.post("/", () => {
  return "emergency: open emergency";
});

router.get("/:id", () => {
  return "emergency: get by id";
});

router.put("/:id/close", () => {
  return "emergency: close emergency";
});

export default router;
