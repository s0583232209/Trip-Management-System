import getConnection from "../config/db.js";
import dblog from "../loggers/database.logger.js";

async function logFileAudit(actionType, id, file) {
  const actionLabel = actionType === "upload_file" ? "uploaded" : "updated";
  await dblog({
    userId: file.uploaderId, 
    actionType,
    tableName: "trip_files", 
    message: `file ${actionLabel} with id ${id} for trip ${file.tripId}`,
    newValues: JSON.stringify({
      id,
      tripId: file.tripId,
      originalName: file.originalName,
      storedName: file.storedName,
      mimeType: file.mimeType,
      fileSize: file.size,
      fileCode: file.fileCode || null,
    }),
  });
}

export async function upload(file) {
  const sql = `
        INSERT IGNORE INTO trip_files (
            trip_id,
            uploaded_by,
            original_name,
            stored_name,
            relative_path,
            mime_type,
            file_extension,
            file_size,
            description,
            file_code
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    file.tripId,
    file.uploaderId,
    file.originalName,
    file.storedName,
    file.relativePath || null,
    file.mimeType,
    file.extension || null,
    file.size,
    file.description,
    file.fileCode || null,
  ];

  const connection = await getConnection();
  let result;
  try {
    [result] = await connection.execute(sql, params);
    await logFileAudit("upload_file", result.insertId, file);
  } catch (err) {
    throw err;
  }
  return result.insertId;
}

export async function getByTripAndFileCode(tripId, fileCode) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT * FROM trip_files WHERE trip_id = ? AND file_code = ?`,
    [tripId, fileCode],
  );
  return rows[0] || null;
}

export async function updateFile(id, file) {
  const connection = await getConnection();
  const sql = `
        UPDATE trip_files SET
            uploaded_by = ?,
            original_name = ?,
            stored_name = ?,
            relative_path = ?,
            mime_type = ?,
            file_extension = ?,
            file_size = ?,
            description = ?
        WHERE id = ?`;
  const params = [
    file.uploaderId,
    file.originalName,
    file.storedName,
    file.relativePath || null,
    file.mimeType,
    file.extension || null,
    file.size,
    file.description,
    id,
  ];
  await connection.execute(sql, params);
  await logFileAudit("update_file", id, file);
  return id;
}

export async function getAllByTripId(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT id, trip_id, uploaded_by, original_name, relative_path, mime_type, file_size, created_at, file_code FROM trip_files WHERE trip_id = ? ORDER BY created_at DESC`,
    [tripId],
  );
  return rows;
}

export async function getById(id) {
  const connection = await getConnection();
  const sql = `
        SELECT *
        FROM trip_files
        WHERE id = ?
    `;

  const [rows] = await connection.execute(sql, [id]);

  return rows[0];
}

export async function getKit(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT id, trip_id, uploaded_by, original_name, relative_path, mime_type, file_size, created_at, file_code
     FROM trip_files
     WHERE trip_id = ? AND file_code IS NOT NULL
     ORDER BY file_code ASC`,
    [tripId],
  );
  return rows;
}

export async function deleteById(id) {
  const connection = await getConnection();
  await connection.execute(
    `
    DELETE FROM trip_files
    WHERE id = ?
    `,
    [id],
  );
}
