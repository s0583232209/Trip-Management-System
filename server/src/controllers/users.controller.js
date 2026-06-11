//this is API layer
import * as usersService from "../services/users.service.js";
import log from "../loggers/file.logger.js";

export async function getUserById(req, res) {
  try {
    // console.log("get user by id");
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`getById error: ${err.message}`);
    res.status(404).json({ message: "משתמש לא נמצא" });
  }
}

export async function updateProfile(req, res) {
  try {
    if (req.user.userId != req.params.id && req.user.role !== "principal")
      return res.status(403).json({ message: "אין הרשאה לעדכן פרופיל זה" });
    log.info(`updateProfile controller - userId: ${req.params.id}`);
    const user = await usersService.updateProfile(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`updateProfile error: ${err.message}`);
    res.status(500).json({ message: "עדכון הפרופיל נכשל, נסה שנית" });
  }
}

export async function changePassword(req, res) {
  try {
    // console.log("change password...............................");
    // console.log("userId=", req.user.userId, "params id=", req.params.id);
    
    if (req.user.userId != req.params.id)
      return res.status(401).json({ message: "אין הרשאה לשנות סיסמא של משתמש אחר" });
    log.info(`change passwrod controller - userId: ${req.params.id}}`);
    const user = await usersService.changePassword(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`change passwrod error: ${err.message}`);
    res.status(err.status || 500).json({ message: err.message });
  }
}
export async function addUser(req, res) {
  try {
    if (req.body.role === "principal")
      return res.status(401).json({ message: "לא ניתן להוסיף מנהל נוסף" });
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
    const message = isDuplicate
      ? "משתמש עם פרטים אלו כבר קיים במערכת"
      : "הוספת המשתמש נכשלה, נסה שנית מאוחר יותר";
    res.status(500).json({ message });
  }
}
export async function getAllUsersBySchool(req, res) {
  try {
    // console.log("get all users by school", req.user);
    const users = await usersService.getAllUsers(req.user.userId);
    res.status(200).json(users);
  } catch (err) {
    log.warn(`getAllUsers error: ${err.message}`);
    res.status(500).json({ message: "טעינת המשתמשים נכשלה, נסה שנית" });
  }
}

export async function deleteUser(req, res, next) {
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

export async function updateUserRole(req, res, next) {
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
