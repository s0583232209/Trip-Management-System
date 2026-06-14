//this is API layer
import * as schoolsService from "../services/schools.service.js";
import log from "../loggers/file.logger.js";

export async function getSchool(req, res, next) {
  console.log("getMySchool - src/controllers/schools.controller.js");
  try {
    const school = await schoolsService.getSchoolForUser(req.user.userId);
    res.status(200).json(school);
  } catch (err) {
    log.warn(`getMySchool error: ${err.message}`);
    err.status = err.status || 404;
    err.message = "בית הספר לא נמצא";
    next(err);
  }
}

export async function updateSchool(req, res, next) {
  console.log("updateMySchool - src/controllers/schools.controller.js");
  try {
    const school = await schoolsService.updateSchoolForUser(
      req.user.userId,
      req.body,
    );
    res.status(200).json(school);
  } catch (err) {
    log.warn(`updateMySchool error: ${err.message}`);
    err.status = err.status || 500;
    err.message = "עדכון פרטי המוסד נכשל, נסה שנית";
    next(err);
  }
}
