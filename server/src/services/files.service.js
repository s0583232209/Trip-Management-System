import * as filesRepository from "../repositories/files.repository.js";
import path from "path";
// OLD getKit (used getAllByTripId — returned all files without file_code filter):
// export async function getKit(tripId) {
//   try {
//     const kit = await filesRepository.getAllByTripId(tripId);
//     return kit;
//   } catch (error) { return null; }
// }
export async function getKit(tripId) {
  try {
    const kit = await filesRepository.getKit(tripId);
    console.log("getKit service, kit=", kit);
    return kit;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function uploadFile(data) {
  console.log("in file service upload", data);
  try {
    const relativePath = path.join(
      "trips",
      data.tripId.toString(),
      "documents",
      data.file.filename,
    );

    // OLD fileToSave (without fileCode):
    // const fileToSave = { tripId, uploaderId, originalName, storedName, relativePath, mimeType, size, description, tripKit: data.tripKit || null };
    const fileToSave = {
      tripId: data.tripId,
      uploaderId: data.user.userId,
      originalName: data.file.originalname,
      storedName: data.file.filename,
      relativePath: relativePath,
      mimeType: data.file.mimetype,
      size: data.file.size,
      description: data.description,
      fileCode: data.fileCode ? Number(data.fileCode) : null,
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
  console.log("in get all files servie, files=", files);
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
