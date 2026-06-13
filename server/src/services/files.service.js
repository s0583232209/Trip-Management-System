// שכבת השירות (BL - Business Logic) של קבצי טיול.
// כאן נמצאת ההחלטה "מה לעשות" עם הקובץ (לשמור/להחליף/למחוק),
// בעוד ש-files.repository.js רק מבצע את שאילתות ה-SQL בפועל.
import * as filesRepository from "../repositories/files.repository.js";
import path from "path";
import fs from "fs/promises";

// פונקציית עזר משותפת: מוחקת קובץ פיזי מהדיסק לפי הנתיב היחסי השמור ב-DB.
// משותפת בין uploadFile (כשמחליפים מסמך קיים) ל-deleteFile (מחיקה רגילה),
// כדי לא לשכפל את החישוב של הנתיב המלא ואת קריאת fs.unlink בשני מקומות.
async function deletePhysicalFile(relativePath) {
  const fullPath = path.join(process.env.UPLOAD_FOLDER, relativePath);
  await fs.unlink(fullPath);
}

// מחזיר את כל קבצי "תיק הטיול" (המסמכים עם file_code) עבור טיול מסוים
export async function getKit(tripId) {
  try {
    const kit = await filesRepository.getKit(tripId);
    return kit;
  } catch (err) {
    throw err;
  }
}

// שומר קובץ שהועלה: אם זהו מסמך תיק-טיול (יש fileCode) שכבר קיים לאותו טיול,
// מחליפים אותו (מעדכנים את אותה שורה ומוחקים את הקובץ הישן מהדיסק).
// אחרת — יוצרים שורה חדשה כרגיל.
export async function uploadFile(data) {
  try {
    // הנתיב היחסי שבו ייקרא הקובץ בדיסק (תחת תיקיית ה-uploads)
    const relativePath = path.join(
      "trips",
      data.tripId.toString(),
      "documents",
      data.file.filename,
    );

    // אובייקט אחיד עם כל המטא-דאטה של הקובץ, שיועבר ל-repository
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

    // אם יש fileCode — בודקים אם כבר קיים מסמך עם אותו קוד באותו טיול
    const existingFile = fileToSave.fileCode
      ? await filesRepository.getByTripAndFileCode(
          data.tripId,
          fileToSave.fileCode,
        )
      : null;

    if (existingFile) {
      // מחליפים מסמך קיים בתיק הטיול: מעדכנים את הרשומה הקיימת ומוחקים את הקובץ הישן מהדיסק
      await deletePhysicalFile(existingFile.relative_path).catch(() => {});
      id = await filesRepository.updateFile(existingFile.id, fileToSave);
    } else {
      // אין מסמך קיים (או שזה קובץ ללא fileCode) — יוצרים שורה חדשה
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

// מחזיר את רשימת כל הקבצים ששייכים לטיול (לתצוגת "כל הקבצים שהועלו")
export async function getAllFiles(tripId) {
  const files = await filesRepository.getAllByTripId(tripId);
  return files;
}

// מחזיר את הנתיב המלא בדיסק וסוג ה-MIME של קובץ, לצורך הורדה/פתיחה בדפדפן
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

// מוחק קובץ לגמרי: גם את הקובץ הפיזי מהדיסק וגם את השורה בטבלת trip_files
export async function deleteFile(fileId) {
  const file = await filesRepository.getById(fileId);
  if (!file) {
    throw new Error("File not found");
  }

  await deletePhysicalFile(file.relative_path);
  await filesRepository.deleteById(fileId);
}
