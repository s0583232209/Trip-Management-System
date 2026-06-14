import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TO_EXTENSIONS = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tripId = req.params.id;
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const uploadPath = path.join(
      __dirname,
      "../../uploads/trips",
      tripId.toString(),
      "documents",
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const decodedName = Buffer.from(file.originalname, "latin1").toString("utf8");
    const safeOriginalName = path
      .basename(decodedName)
      .replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, "_");

    file.originalname = safeOriginalName;
    const fileName = `${Date.now()}-${safeOriginalName}`;
    cb(null, fileName);
  },
});

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
