import express from "express";

const router = express.Router();
router.get("/", (req, res) => {
  res.send("trips: get all");
});
router.post("/", (req, res) => {
  res.send("trips: post add a trip");
});
router.get("/:id", (req, res) => {
  res.send("trips: get by id");
});
router.delete("/:id", (req, res) => {
  res.send("trips: delete by id");
});
router.put("/:id/approve", (req, res) => {
  res.send("trips: put, approve trip" + id);
});
router.put("/:id/close", (req, res) => {
  res.send("trips: put, close trip" + id);
});
router.get("/:id/staff", (req, res) => {
  res.send("trips: get, staff");
});
router.post("/:id/staff", (req, res) => {
  res.send("trips: post, staff");
});
export default router;
