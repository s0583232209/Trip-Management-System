//this is the DAL
import getConnection from "../config/db.js";
export async function upload(file) {
  // console.log("in repo uploading file=", file);
  // OLD (without file_code):
  // const sql = `INSERT INTO trip_files (trip_id, trip_kit, uploaded_by, original_name, stored_name, relative_path, mime_type, file_extension, file_size, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  // const params = [file.tripId, file.tripKit || null, file.uploaderId, file.originalName, file.storedName, file.relativePath || "retlevit path", file.mimeType, file.extension || null, file.size, file.description];
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
  let a;
  try {
    // console.log(params, "params from repo");
    const [result] = await connection.execute(sql, params);
    a = result;
  } catch (err) {
    // console.log(err);
  }
  // console.log(a, "this is the result from repo");
  return a.insertId;
}
export async function getAllByTripId(tripId) {
  const connection = await getConnection();
  // OLD (without file_code):
  // const [rows] = await connection.execute(`SELECT id, trip_id, uploaded_by, original_name, relative_path, mime_type, file_size, created_at FROM trip_files WHERE trip_id = ?`, [tripId]);
  const [rows] = await connection.execute(
    `SELECT id, trip_id, uploaded_by, original_name, relative_path, mime_type, file_size, created_at, file_code FROM trip_files WHERE trip_id = ? ORDER BY created_at DESC`,
    [tripId],
  );
  // console.log("in get all files repository, files=", rows);
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
// OLD getKit (queried by trip_kit FK, returned only first row):
// export async function getKit(kitId) {
//   const connection = await getConnection();
//   const sql = `SELECT * FROM trip_files WHERE trip_kit= ?`;
//   const [rows] = await connection.execute(sql, [kitId]);
//   return rows[0];
// }
export async function getKit(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT id, trip_id, uploaded_by, original_name, relative_path, mime_type, file_size, created_at, file_code
     FROM trip_files
     WHERE trip_id = ? AND file_code IS NOT NULL
     ORDER BY file_code ASC`,
    [tripId],
  );
  // console.log("getKit files=", rows);
  return rows;
}
