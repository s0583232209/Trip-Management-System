//this is the DAL
import log from "../loggers/file.logger.js";
import getConnection from "../config/db.js";

export async function getAll(tripId) {
  const connection = await getConnection();
  const [rows] = null;
  //if we actually have media - so to pull it form here
  log.info(`getAll media by tripId: ${tripId}`);
  return rows;
}
