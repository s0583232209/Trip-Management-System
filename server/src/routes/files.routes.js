// files.routes.js

import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", () => {
  return "files: get all";
});

router.post("/", () => {
  return "files: upload file";
});

router.get("/:id", () => {
  return "files: get by id";
});

router.delete("/:id", () => {
  return "files: delete by id";
});



export default router;