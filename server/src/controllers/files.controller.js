import * as fileService from "../services/files.service.js";

async function handleUpload(req, res, next, fileCode) {
  try {
    const result = await fileService.uploadFile({
      file: req.file, 
      tripId: req.params.id,
      description: req.body.description,
      fileCode, 
      user: req.user, 
    });
    res.status(201).json(result);
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
}

export async function getKit(req, res, next) {
  try {
    const kit = await fileService.getKit(req.params.id);
    res.status(200).json(kit);
  } catch (err) {
    err.status = err.status || 500;
    next(err);
  }
}

export async function addToKit(req, res, next) {
  await handleUpload(req, res, next, req.body.fileCode);
}

export async function getAllFiles(req, res, next) {
  try {
    const files = await fileService.getAllFiles(req.params.id);
    res.status(200).json(files);
  } catch (error) {
    error.status = error.status || 500;
    next(error);
  }
}

export async function uploadFile(req, res, next) {
  await handleUpload(req, res, next, undefined);
}

export async function getFile(req, res, next) {
  try {
    const file = await fileService.getFile(req.params.id);
    res.sendFile(file.fullPath);
  } catch (err) {
    err.status = err.status || 500;
    err.message = err.message || "Server faild to get the file";
    next(err);
  }
}

export async function deleteFile(req, res, next) {
  try {
    await fileService.deleteFile(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    err.status = err.status || 500;
    next(err);
  }
}
