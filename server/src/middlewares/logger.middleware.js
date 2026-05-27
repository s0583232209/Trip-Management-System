import dblog from "../loggers/database.logger.js";
import log from "../loggers/file.logger.js";
export default async function logger(req, res, next) {
  log.info(`user id:${req.userId}, method:${req.method}, url:${req.path}`);
  if (req.path.includes("auth") && !req.path.includes("signup")) {
    dblog({
      user_id: req.userId,
      message: `path: ${req.path}. body: ${req.body}`,
    });
  }
  next()
}
