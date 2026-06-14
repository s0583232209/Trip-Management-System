import * as filesRepository from "../repositories/files.repository.js";
import path from "path";
import fs from "fs/promises";

async function deletePhysicalFile(relativePath) {
  const fullPath = path.join(process.env.UPLOAD_FOLDER, relativePath);
  await fs.unlink(fullPath);
}

export async function getKit(tripId) {
  try {
    const kit = await filesRepository.getKit(tripId);
    return kit;
  } catch (err) {
    throw err;
  }
}

export async function uploadFile(data) {
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
      fileCode: data.fileCode ? Number(data.fileCode) : null,
    };

    let id;

    const existingFile = fileToSave.fileCode
      ? await filesRepository.getByTripAndFileCode(
          data.tripId,
          fileToSave.fileCode,
        )
      : null;

    if (existingFile) {
      await deletePhysicalFile(existingFile.relative_path).catch(() => {});
      id = await filesRepository.updateFile(existingFile.id, fileToSave);
    } else {
      id = await filesRepository.upload(fileToSave);
    }

    return {
      id,
      fileName: fileToSave.originalName,
    };
  } catch (err) {
    throw err
    ;
  }
}
export async function getAllFiles(tripId) {
  const files = await filesRepository.getAllByTripId(tripId);
  return files;
}

export async function getFile(id) {
  const file = await filesRepository.getById(id);
  if (!file) {
    throw new Error("File not found");
  }

  const filePath = path.join(process.env.UPLOAD_FOLDER, file.relative_path);
  return {
    fullPath: filePath,
    mimeType: file.mime_type,
  };
}

export async function deleteFile(fileId) {
  const file = await filesRepository.getById(fileId);
  if (!file) {
    throw new Error("File not found");
  }

  await deletePhysicalFile(file.relative_path);
  await filesRepository.deleteById(fileId);
}
