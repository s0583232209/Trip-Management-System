import loggerServic from "../services/logger.service.js";

export default async function dblog(details) {
  console.log("dblog - src/loggers/database.logger.js");
  await loggerServic(details);
}
