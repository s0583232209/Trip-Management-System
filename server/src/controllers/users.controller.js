//this is API layer
import * as usersService from "../services/users.service.js";
import log from "../loggers/file.logger.js";

export async function getUserById(req, res) {
  try {
    console.log("get user by id");
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`getById error: ${err.message}`);
    res.status(404).json({ message: "User not found" });
  }
}

export async function updateProfile(req, res) {
  try {
    log.info(
      `updateProfile controller - userId: ${req.params.id}, body: ${JSON.stringify(req.body)}`,
    );
    console.log("updateProfile...............................");
    const user = await usersService.updateProfile(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`updateProfile error: ${err.message}`);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
}

export async function changePassword(req, res) {
  try {
    console.log("change password...............................");
    if (req.body.userId != req.params.id) res.status(401).send("access denied");
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
      res
        .status("401")
        .message("Bad Request: you can not add another principal");
    const user = await usersService.addUser(req.body);
    res.status(200).json(user);
  } catch (err) {
    log.warn(`addUser error: ${err.message}`);
    res.status(500).json({ message: "Failed to add user" });
  }
}
