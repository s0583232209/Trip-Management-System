// מידלוור Multer — אחראי לקבל קובץ שהועלה (multipart/form-data) ולשמור אותו בדיסק
// לפני שהבקשה מגיעה ל-controller. ה-controller מקבל את הפרטים דרך req.file.
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
    file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
    const fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});

// limits.fileSize מגביל את גודל הקובץ המותר ל-50MB
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
export default upload;
