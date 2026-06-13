import dblog from "../loggers/database.logger.js";
import log from "../loggers/file.logger.js";
export default async function logger(req, res, next) {
  console.log("logger - src/middlewares/logger.middleware.js");
  log.info(`user id:${req.params.id}, method:${req.method}, url:${req.path}`);
  if (req.path.includes("auth")) {
    await dblog({
      userId: req.userId,
      actionType: "auth",
      message: `path: ${req.path}. body: ${JSON.stringify({...req.body,password:null})}`,
    });
  }
  console.log("end of logger middleware");

  next();
}
