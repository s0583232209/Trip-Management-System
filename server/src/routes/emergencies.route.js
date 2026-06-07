import express from "express";
import * as emergenciesController from "../controllers/emergencies.controller.js";

const router = express.Router();

router.get("/trip/:tripId", emergenciesController.getByTripId);
router.post("/", emergenciesController.create);
router.put("/:id", emergenciesController.update);
router.delete("/:id", emergenciesController.remove);

export default router;
