//this is API layer
import log from "../loggers/file.logger.js";
import * as mediaService from "../services/media.service.js";

export async function getAllMedia(req, res) {
  try {
    const media = await mediaService.getAllMedia(req.params.id);
    res.status(200).json(media);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    res.status(500).json({ message: "Failed to get media" });
  }
}