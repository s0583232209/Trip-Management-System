//this is the DAL
import getConnection from "../config/db.js";
export async function upload(file) {
  console.log("in repo uploading file");
  const sql = `
        INSERT INTO trip_files (
            trip_id,
            uploaded_by,
            original_name,
            stored_name,
            relative_path,
            mime_type,
            file_extension,
            file_size,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    file.tripId,
    file.uploaderId,
    file.originalName,
    file.storedName,
    file.relativePath || "retlevit path", //no-fixed
    file.mimeType,
    file.extension || null, //no
    file.size,
    file.description,
  ];
  const connection = await getConnection();
  let a;
  try {
    console.log(params, "params from repo");
    const [result] = await connection.execute(sql, params);
    a = result;
  } catch (err) {
    console.log(err);
  }
  console.log(a, "this is the result from repo");
  return a.insertId;
}
export async function getAllByTripId(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT id, trip_id, uploader_id, original_name, stored_path, mime_type, size_bytes, uploaded_at FROM trip_files WHERE trip_id = ?`,
    [tripId],
  );
  console.log("in get all files repository, files=", rows);
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
