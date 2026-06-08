import * as filesRepository from "../repositories/files.repository.js";
import path from "path";
export async function uploadFile(data) {
  console.log("in file service upload", data);
  try {
    const relativePath = path.join(
      "trips",
      data.tripId.toString(),
      "documents",
      data.file.filename,
    );

    const fileToSave = {
      tripId: data.tripId,
      uploaderId: data.user.userId,
      originalName: data.file.originalname,
      storedName: data.file.filename,
      relativePath: relativePath,
      mimeType: data.file.mimetype,
      size: data.file.size,
      description: data.description,
    };
    console.log(fileToSave, "file to save in service");
    const id = await filesRepository.upload(fileToSave);
    return {
      id,
      fileName: fileToSave.originalName,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getAllFiles(tripId) {
  const files = await filesRepository.getAllByTripId(tripId);
  console.log("in get all files servie, files=",files)
  return files;
}

export async function getFile(id) {
  const file = await filesRepository.getById(id);
  if (!file) {
    throw new Error("File not found");
  }
  console.log("after ifs");
  console.log("UPLOAD_FOLDER =", process.env.UPLOAD_FOLDER);
  console.log("file =", file);
  console.log("file.relative_path =", file.relative_path);
  const filePath = path.join(process.env.UPLOAD_FOLDER, file.relative_path);
  console.log(filePath);
  return {
    fullPath: filePath,
    mimeType: file.mime_type,
  };
}
