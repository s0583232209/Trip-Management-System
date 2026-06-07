import * as filesRepository from "../repositories/files.repository.js";
export async function uploadFile(data) {
  console.log("in file service upload", data);
  const fileToSave = {
    tripId: data.tripId,
    uploaderId: data.user.userId,
    originalName: data.file.originalname,
    storedName: data.file.filename,
    reletivePath: data.file.destination,
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
}
