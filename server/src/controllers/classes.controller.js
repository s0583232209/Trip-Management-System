//this is API layer
import log from "../loggers/file.logger.js";
import * as classesService from "../services/classes.service.js";

export async function getAllClasses(req, res) {
  console.log("getAllClasses - src/controllers/classes.controller.js");
  try {
    const classes = await classesService.getAllClasses(req.user.userId);
    res.status(200).json(classes);
  } catch (err) {
    log.warn(`getAllClasses error: ${err.message}`);
    res.status(500).json({ message: "Failed to get classes" });
  }
}

export async function addClass(req, res) {
  console.log("addClass - src/controllers/classes.controller.js");
  try {
    if (!req.body.className || !req.body.grade) {
      return res
        .status(400)
        .json({ message: "className and grade are required" });
    }
    const newClass = await classesService.addClass(req.user.userId, req.body);
    log.info(`new class added successfully`);
    res.status(201).json(newClass);
  } catch (err) {
    log.warn(`addClass error: ${err.message}`);
    res.status(500).json({ message: "Failed to add class" });
  }
}
