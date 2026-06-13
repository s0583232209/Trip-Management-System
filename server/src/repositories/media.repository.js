//this is the DAL
import log from "../loggers/file.logger.js";
import getConnection from "../config/db.js";

export async function getAll(tripId) {
  console.log("getAll - src/repositories/media.repository.js");
  const connection = await getConnection();
  const [rows] = ["nothing"];
  //if we actually have media - so to pull it form here
  log.info(`getAll media by tripId: ${tripId}`);
  return rows;
}
