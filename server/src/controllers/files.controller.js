// API layer — מקבל בקשות HTTP, מעביר אותן לשכבת השירות (files.service.js),
// ומחזיר לקליינט תשובה (קוד סטטוס + JSON / קובץ).
import * as fileService from "../services/files.service.js";

// פונקציית עזר משותפת: מעלה קובץ (רגיל או מסמך תיק-טיול) ומחזירה תשובת 201.
// משותפת בין uploadFile ל-addToKit כדי לא לשכפל את אותה קריאה לשירות פעמיים.
async function handleUpload(req, res, fileCode) {
  try {
    const result = await fileService.uploadFile({
      file: req.file, // הקובץ עצמו — הגיע ממידלוור multer (upload.middleware.js)
      tripId: req.params.id, // מזהה הטיול, מתוך פרמטר הנתיב
      description: req.body.description, // תיאור חופשי שהוזן בטופס
      fileCode, // קוד מסמך (לתיק טיול) או undefined עבור קובץ רגיל
      user: req.user, // המשתמש המחובר (נקבע ע"י verifyToken middleware)
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// GET /:id/files/kit — מחזיר את כל מסמכי תיק הטיול (קבצים עם file_code)
export async function getKit(req, res) {
  try {
    const kit = await fileService.getKit(req.params.id);
    res.status(200).json(kit);
  } catch (err) {
    res.status(500).json(`message: ${err.message}`);
  }
}

// POST /:id/files/kit — העלאת/החלפת מסמך בתיק הטיול (יש קוד מסמך - file_code)
export async function addToKit(req, res) {
  await handleUpload(req, res, req.body.fileCode);
}

// GET /:id/files — מחזיר את כל הקבצים שהועלו לטיול (כולל קבצים נוספים שאינם בתיק)
export async function getAllFiles(req, res) {
  try {
    const files = await fileService.getAllFiles(req.params.id);
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// POST /:id/files — העלאת קובץ "רגיל" לטיול (ללא קוד מסמך)
export async function uploadFile(req, res) {
  await handleUpload(req, res, undefined);
}

// GET /:id/files/:id — פותח/מוריד קובץ בודד לפי id
export async function getFile(req, res, next) {
  try {
    const file = await fileService.getFile(req.params.id);
    res.sendFile(file.fullPath);
  } catch (err) {
    next(err);
  }
}

// DELETE /:id/files/:id — מוחק קובץ (גם הקובץ הפיזי מהדיסק וגם השורה ב-DB)
export async function deleteFile(req, res) {
  try {
    await fileService.deleteFile(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
