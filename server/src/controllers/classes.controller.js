//this is API layer
import log from "../loggers/file.logger.js";
import * as classesService from "../services/classes.service.js";

export async function getAllClasses(req, res, next) {
  console.log("getAllClasses - src/controllers/classes.controller.js");
  try {
    const classes = await classesService.getAllClasses(req.user.userId);
    res.status(200).json(classes);
  } catch (err) {
    log.warn(`getAllClasses error: ${err.message}`);
    err.status = err.status || 500;
    err.message = "Failed to get classes";
    next(err);
  }
}

export async function addClass(req, res, next) {
  console.log("addClass - src/controllers/classes.controller.js");
  try {
    if (!req.body.className || !req.body.grade) {
      const error = new Error("className and grade are required");
      error.status = 400;
      return next(error);
    }
    const newClass = await classesService.addClass(req.user.userId, req.body);
    log.info(`new class added successfully`);
    res.status(201).json(newClass);
  } catch (err) {
    log.warn(`addClass error: ${err.message}`);
    err.status = err.status || 500;
    err.message = "Failed to add class";
    next(err);
  }
}

export async function updateClass(req, res) {
  console.log("updateClass - src/controllers/classes.controller.js");
  try {
    if (!req.body.className || !req.body.grade) {
      return res
        .status(400)
        .json({ message: "className and grade are required" });
    }
    const updated = await classesService.updateClass(
      req.user.userId,
      req.params.id,
      req.body,
    );
    if (!updated) {
      return res.status(404).json({ message: "Class not found" });
    }
    log.info(`class updated successfully`);
    res.status(200).json(updated);
  } catch (err) {
    log.warn(`updateClass error: ${err.message}`);
    res.status(500).json({ message: "Failed to update class" });
  }
}

export async function deleteClass(req, res) {
  console.log("deleteClass - src/controllers/classes.controller.js");
  try {
    const deleted = await classesService.deleteClass(
      req.user.userId,
      req.params.id,
    );
    if (!deleted) {
      return res.status(404).json({ message: "Class not found" });
    }
    log.info(`class deleted successfully`);
    res.status(204).send();
  } catch (err) {
    log.warn(`deleteClass error: ${err.message}`);
    res.status(500).json({ message: "Failed to delete class" });
  }
}
