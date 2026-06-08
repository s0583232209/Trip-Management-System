//this is API layer
import * as fileService from "../services/files.service.js";
export async function uploadFile(req, res) {
  console.log("in file controller upload");
  try {
    const result = await fileService.uploadFile({
      file: req.file,
      tripId: req.params.id,
      description: req.body.description,
      user: req.user,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).send("error: " + error);
  }
}
export async function getFile(req, res, next) {
  try {
    const file = await fileService.getFile(req.params.id);

    res.sendFile(file.fullPath);
  } catch (err) {
    next(err);
  }
}
