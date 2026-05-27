import loggerServic from "../services/logger.service.js";

export default async function dblog(details) {
  await loggerServic(details);
}
