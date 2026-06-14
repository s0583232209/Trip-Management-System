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
