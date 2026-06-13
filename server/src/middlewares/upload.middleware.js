// מידלוור Multer — אחראי לקבל קובץ שהועלה (multipart/form-data) ולשמור אותו בדיסק
// לפני שהבקשה מגיעה ל-controller. ה-controller מקבל את הפרטים דרך req.file.
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// גודל קובץ מקסימלי מותר להעלאה
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// סוגי קבצים מותרים להעלאה — מאפיין כל MIME type לרשימת הסיומות התואמות לו.
// בודקים גם MIME וגם סיומת כדי שקובץ מסוכן (לדוגמה HTML/SVG) לא יוכל "להתחזות"
// לסוג קובץ מותר ולגרום ל-Stored XSS כאשר הוא מוגש בחזרה ע"י res.sendFile לפי סיומתו.
const ALLOWED_MIME_TO_EXTENSIONS = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const storage = multer.diskStorage({
  // קובע לאיזו תיקייה לשמור את הקובץ: uploads/trips/<tripId>/documents
  destination: (req, file, cb) => {
    const tripId = req.params.id;
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const uploadPath = path.join(
      __dirname,
      "../../uploads/trips",
      tripId.toString(),
      "documents",
    );

    // אם התיקייה עוד לא קיימת — יוצרים אותה (כולל תיקיות הורה)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  // קובע את שם הקובץ בדיסק: timestamp + שם הקובץ המקורי, כדי למנוע התנגשויות שמות
  filename: (req, file, cb) => {
    const decodedName = Buffer.from(file.originalname, "latin1").toString("utf8");

    // מנקים את שם הקובץ המקורי לפני שהוא משולב בשם הקובץ שנשמר בדיסק:
    // - path.basename מסיר כל מרכיב נתיב (כולל ../) ומשאיר רק את שם הקובץ עצמו
    // - מסירים תווי בקרה ותווים שאינם חוקיים בשם קובץ
    const safeOriginalName = path
      .basename(decodedName)
      .replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, "_");

    file.originalname = safeOriginalName;
    const fileName = `${Date.now()}-${safeOriginalName}`;
    cb(null, fileName);
  },
});

// מסנן קבצים: מאפשר רק PDF, PNG ו-JPG/JPEG, ובודק התאמה בין ה-MIME type לסיומת הקובץ
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ALLOWED_MIME_TO_EXTENSIONS[file.mimetype];

  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    const err = new Error("ניתן להעלות קבצי PDF, PNG או JPG בלבד");
    err.status = 400;
    return cb(err);
  }

  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// עוטף את upload.single כדי לתרגם שגיאות Multer (חריגה ממגבלת הגודל / סוג קובץ לא מורשה)
// להודעות שגיאה בעברית עם status מתאים, לפני שהן מגיעות ל-errorHandler הגלובלי
export function uploadSingle(fieldName) {
  const handler = upload.single(fieldName);
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          err.message = "גודל הקובץ חורג מהמגבלה המותרת (5MB)";
          err.status = 400;
        }
        return next(err);
      }
      next();
    });
  };
}

export default upload;
