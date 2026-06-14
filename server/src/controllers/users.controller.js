//this is API layer
import * as usersService from "../services/users.service.js";
import log from "../loggers/file.logger.js";

export async function getUserById(req, res, next) {
  console.log("getUserById - src/controllers/users.controller.js");
  try {
    // console.log("get user by id");
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`getById error: ${err.message}`);
    err.status = 404;
    err.message = "משתמש לא נמצא";
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  console.log("updateProfile - src/controllers/users.controller.js");
  try {
    const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);
    if (req.user.userId != req.params.id && !userRoles.includes("principal")) {
      const error = new Error("אין הרשאה לעדכן פרופיל זה");
      error.status = 403;
      return next(error);
    }
    log.info(`updateProfile controller - userId: ${req.params.id}`);
    const user = await usersService.updateProfile(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`updateProfile error: ${err.message}`);
    err.status = 500;
    err.message = "עדכון הפרופיל נכשל, נסה שנית";
    next(err);
  }
}

export async function changePassword(req, res, next) {
  console.log("changePassword - src/controllers/users.controller.js");
  try {
    // console.log("change password...............................");
    // console.log("userId=", req.user.userId, "params id=", req.params.id);

    if (req.user.userId != req.params.id) {
      const error = new Error("אין הרשאה לשנות סיסמא של משתמש אחר");
      error.status = 401;
      return next(error);
    }
    log.info(`change passwrod controller - userId: ${req.params.id}}`);
    const user = await usersService.changePassword(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`change passwrod error: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function addUser(req, res, next) {
  console.log("addUser - src/controllers/users.controller.js");
  try {
    if (req.body.role === "principal") {
      const error = new Error("לא ניתן להוסיף מנהל נוסף");
      error.status = 401;
      return next(error);
    }
    const user = await usersService.addUser(
      {
        ...req.body,
        principalId: req.user.userId,
      },
      false,
    );
    res.status(200).json(user);
  } catch (err) {
    log.warn(`addUser error: ${err.message}`);
    const isDuplicate = err.message?.includes("Duplicate entry");
    err.status = 500;
    err.message = isDuplicate
      ? "משתמש עם פרטים אלו כבר קיים במערכת"
      : "הוספת המשתמש נכשלה, נסה שנית מאוחר יותר";
    next(err);
  }
}
export async function getAllUsersBySchool(req, res, next) {
  console.log("getAllUsersBySchool - src/controllers/users.controller.js");
  try {
    // console.log("get all users by school", req.user);
    const users = await usersService.getAllUsers(req.user.userId);
    res.status(200).json(users);
  } catch (err) {
    log.warn(`getAllUsers error: ${err.message}`);
    err.status = 500;
    err.message = "טעינת המשתמשים נכשלה, נסה שנית";
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  console.log("deleteUser - src/controllers/users.controller.js");
  try {
    const result = await usersService.deleteUser(
      req.params.id,
      req.user.userId,
    );
    log.info(`user ${req.params.id} deleted by ${req.user.userId}`);
    res.status(200).json({ message: "המשתמש נמחק בהצלחה", ...result });
  } catch (error) {
    log.warn(`deleteUser error: ${error.message}`);
    next(error);
  }
}

export async function addUserRole(req, res, next) {
  console.log("addUserRole - src/controllers/users.controller.js");
  try {
    const result = await usersService.addUserRole(req.params.id, req.body.role);
    res.status(200).json({ message: "התפקיד נוסף בהצלחה", ...result });
  } catch (error) {
    next(error);
  }
}

export async function removeUserRole(req, res, next) {
  console.log("removeUserRole - src/controllers/users.controller.js");
  try {
    const result = await usersService.removeUserRole(req.params.id, req.params.role);
    res.status(200).json({ message: "התפקיד הוסר בהצלחה", ...result });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  console.log("updateUserRole - src/controllers/users.controller.js");
  try {
    const result = await usersService.updateUserRole(
      req.params.id,
      req.body.role,
    );
    log.info(`role for user ${req.params.id} updated to ${req.body.role}`);
    res.status(200).json({ message: "התפקיד עודכן בהצלחה", ...result });
  } catch (error) {
    log.warn(`updateUserRole error: ${error.message}`);
    next(error);
  }
}
