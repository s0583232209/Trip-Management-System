// media.routes.js

import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", () => {
  return "media: get all";
});

router.post("/", () => {
  return "media: upload media";
});

router.get("/:id", () => {
  return "media: get media by id";
});

router.delete("/:id", () => {
  return "media: delete media";
});

export default router;
