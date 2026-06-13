//this is BL layer
import log from "../loggers/file.logger.js";
import * as classesRepo from "../repositories/classes.repository.js";
import * as usersRepo from "../repositories/users.repository.js";

export async function getAllClasses(userId) {
  console.log("getAllClasses - src/services/classes.service.js");
  try {
    const { school_id } = await usersRepo.getById(userId);
    const classes = await classesRepo.getAllClasses(school_id);
    log.info(`get all classes for school: ${school_id}`);
    return classes;
  } catch (err) {
    log.warn(`error: ${err.message}, from getAllClasses in classes.service`);
    throw err;
  }
}

export async function addClass(userId, details) {
  console.log("addClass - src/services/classes.service.js");
  try {
    const { school_id } = await usersRepo.getById(userId);
    const newClass = await classesRepo.addClass({
      schoolId: school_id,
      className: details.className,
      grade: details.grade,
    });
    log.info(`class added successfully for school: ${school_id}`);
    return newClass;
  } catch (err) {
    log.warn(`error: ${err.message}, from addClass in classes.service`);
    throw err;
  }
}
