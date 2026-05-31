// emergency.routes.js

import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", requireRole("principal", "coordinator", "trip leader"),() => {
  return "emergency: get all emergencies";
});

router.post("/",requireRole( "trip leader", "teacher"), () => {
  return "emergency: open emergency";
});

router.get("/:id",requireRole("principal", "coordinator", "tripLeader", "teacher"), () => {
  return "emergency: get by id";
});

router.put("/:id/close", () => {
  return "emergency: close emergency";
});

export default router;
