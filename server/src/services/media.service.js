//this is BL layer
import log from "../loggers/file.logger.js";
import { getAll } from "../repositories/media.repository.js";

export async function getAllMedia(tripId) {
  console.log("getAllMedia - src/services/media.service.js");
  const media = await getAll(tripId);
  log.info(`get all media by tripId: ${tripId}`);
  return media;
}