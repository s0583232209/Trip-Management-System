import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tripId = req.params.id;
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const uploadPath = path.join(
      __dirname,
      "../../uploads/trips",
      tripId.toString(),
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;

    cb(null, fileName);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
export default upload;
