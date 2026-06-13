// DAL (Data Access Layer) — כל הגישה הישירה לטבלת trip_files נמצאת כאן.
// כל פונקציה כאן מקבלת חיבור לדאטאבייס, מריצה שאילתת SQL אחת, ומחזירה תוצאה "גולמית".
import getConnection from "../config/db.js";
import dblog from "../loggers/database.logger.js";

// פונקציית עזר משותפת: רושמת ל-audit_log (טבלת ביקורת) כל הוספה/עדכון של קובץ.
// משותפת בין upload() ל-updateFile() כדי לא לשכפל את אותו אובייקט לוג פעמיים.
async function logFileAudit(actionType, id, file) {
  const actionLabel = actionType === "upload_file" ? "uploaded" : "updated";
  await dblog({
    userId: file.uploaderId, // מי ביצע את הפעולה
    actionType, // "upload_file" או "update_file"
    tableName: "trip_files", // הטבלה שהשתנתה
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

// מוסיף שורת קובץ חדשה לטבלת trip_files ומחזיר את ה-id החדש שנוצר
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

  // הסדר כאן חייב להתאים בדיוק לסדר העמודות ברשימת ה-INSERT למעלה
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
    // לאחר הוספה מוצלחת — מתעדים את הפעולה בטבלת audit_log
    await logFileAudit("upload_file", result.insertId, file);
  } catch (err) {
    console.log(err);
    throw err;
  }
  return result.insertId;
}

// מחפש שורה קיימת בתיק הטיול לפי trip_id + file_code (קוד מסמך)
// משמש כדי לדעת אם מסמך מסוים כבר הועלה לפני, לצורך החלפה במקום שכפול
export async function getByTripAndFileCode(tripId, fileCode) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT * FROM trip_files WHERE trip_id = ? AND file_code = ?`,
    [tripId, fileCode],
  );
  return rows[0] || null;
}

// מעדכן שורת קובץ קיימת (לפי id) עם פרטי הקובץ החדש — משמש להחלפת מסמך קיים בתיק הטיול
// כך נשארת שורה אחת בלבד לכל שילוב trip_id+file_code, במקום ליצור שורה כפולה
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
  // לאחר עדכון מוצלח — מתעדים את הפעולה בטבלת audit_log
  await logFileAudit("update_file", id, file);
  return id;
}

// מחזיר את כל הקבצים ששייכים לטיול מסוים (לא רק קבצי תיק טיול), מהחדש לישן
export async function getAllByTripId(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT id, trip_id, uploaded_by, original_name, relative_path, mime_type, file_size, created_at, file_code FROM trip_files WHERE trip_id = ? ORDER BY created_at DESC`,
    [tripId],
  );
  return rows;
}

// מחזיר שורת קובץ בודדת לפי id (כל העמודות) — משמש להורדה/פתיחה ולמחיקה
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

// מחזיר רק את קבצי "תיק הטיול" (כאלה עם file_code), ממוינים לפי קוד המסמך
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

// מוחק שורת קובץ מהטבלה לפי id (הקובץ הפיזי בדיסק נמחק בנפרד, בשכבת השירות)
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
