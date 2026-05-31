import express from "express";
import requireRole from "../middlewares/roleGuard.middlware.js";
const router = express.Router();
router.get("/", requireRole("principal", "coordinator"), (req, res) => {
  res.send("trips: get all");
});
router.post("/", requireRole("principal", "coordinator"), (req, res) => {
  res.send("trips: post add a trip");
});
router.get(
  "/:id",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  (req, res) => {
    res.send("trips: get by id");
  },
);
router.delete("/:id", requireRole("principal", "coordinator"), (req, res) => {
  res.send("trips: delete by id");
});
router.put(
  "/:id/approve",
  requireRole("principal", "coordinator"),
  (req, res) => {
    res.send("trips: put, approve trip" + id);
  },
);
router.put(
  "/:id/close",
  requireRole("principal", "coordinator"),
  (req, res) => {
    res.send("trips: put, close trip" + id);
  },
);
router.get(
  "/:id/staff",
  requireRole("principal", "coordinator", "trip leader", "teacher"),
  (req, res) => {
    res.send("trips: get, staff");
  },
);
router.post(
  "/:id/staff",
  requireRole("principal", "coordinator"),
  (req, res) => {
    res.send("trips: post, staff");
  },
);
export default router;
