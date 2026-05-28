import dblog from "../loggers/database.logger.js";
import log from "../loggers/file.logger.js";
export default async function logger(req, res, next) {
  log.info(`user id:${req.userId}, method:${req.method}, url:${req.path}`);
  if (req.path.includes("auth")) {
    await dblog({
      userId: req.userId,
      actionType: "auth",
      message: `path: ${req.path}. body: ${JSON.stringify(req.body)}`,
    });
  }
  console.log("end of logger middleware");

  next();
}
