//this is API layer
import log from "../loggers/file.logger.js";
import * as tripsService from "../services/trips.service.js";
import { createParentToken } from "../services/auth.service.js";
import fs from "fs/promises";
import path from "path";

// תיקיית הקבצים הפיזית שבה מאוחסנים קובצי התבניות/העזר לעמוד "דוגמה ומדריך למילוי אוגדן ותיק טיול"
function getExampleKitTemplatesDir() {
  return path.join(process.env.UPLOAD_FOLDER, "trips", "templates");
}

// תבניות PDF ריקות לדוגמה עבור עמוד "דוגמה ומדריך למילוי אוגדן ותיק טיול".
// כל אובייקט תואם למבנה שורת קובץ אמיתית מטבלת trip_files, כך שניתן
// להציג אותו ישירות בממשק תיק הטיול (לפי file_code 1-11).
const EXAMPLE_KIT_TEMPLATES = [
  {
    id: -1,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-01-מינוי-אחראי-טיול.pdf",
    relative_path: "trips/templates/תבנית-ריקה-01-מינוי-אחראי-טיול.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 1,
  },
  {
    id: -2,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-02-אישור-יציאה-לטיול-ממנהל-מוסד.pdf",
    relative_path:
      "trips/templates/תבנית-ריקה-02-אישור-יציאה-לטיול-ממנהל-מוסד.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 2,
  },
  {
    id: -3,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-03-אישורי-הורים.pdf",
    relative_path: "trips/templates/תבנית-ריקה-03-אישורי-הורים.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 3,
  },
  {
    id: -4,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-04-רשימת-תלמידים.pdf",
    relative_path: "trips/templates/תבנית-ריקה-04-רשימת-תלמידים.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 4,
  },
  {
    id: -5,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-05-רשימת-תלמידים-עם-מגבלות-רפואיות.pdf",
    relative_path:
      "trips/templates/תבנית-ריקה-05-רשימת-תלמידים-עם-מגבלות-רפואיות.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 5,
  },
  {
    id: -6,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "טופס הפניה לטיפול רפואי לתלמיד שנפגע במהלך טיול.pdf",
    relative_path:
      "trips/templates/טופס הפניה לטיפול רפואי לתלמיד שנפגע במהלך טיול.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 6,
  },
  {
    id: -7,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-07-רשימת-תלמידים-שנפגעו-במהלך-טיול.pdf",
    relative_path:
      "trips/templates/תבנית-ריקה-07-רשימת-תלמידים-שנפגעו-במהלך-טיול.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 7,
  },
  {
    id: -8,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-08-טופס-ביטוח-למתנדב.pdf",
    relative_path:
      "trips/templates/תבנית-ריקה-08-טופס-ביטוח-למתנדב.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 8,
  },
  {
    id: -9,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-09-רשימת-מלווים-וטלפונים-חיוניים.pdf",
    relative_path:
      "trips/templates/תבנית-ריקה-09-רשימת-מלווים-וטלפונים-חיוניים.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 9,
  },
  {
    id: -10,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-10-הנחיות-למורה-אחראי-כיתה.pdf",
    relative_path:
      "trips/templates/תבנית-ריקה-10-הנחיות-למורה-אחראי-כיתה.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 10,
  },
  {
    id: -11,
    trip_id: "example-kit",
    uploaded_by: null,
    original_name: "תבנית-ריקה-11-טופס-תיאום-טיולים-מאושר.pdf",
    relative_path:
      "trips/templates/תבנית-ריקה-11-טופס-תיאום-טיולים-מאושר.pdf",
    mime_type: "application/pdf",
    file_size: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    file_code: 11,
  },
];

export async function getAllTrips(req, res, next) {
  console.log("getAllTrips - src/controllers/trips.controller.js");
  try {
    const trips = await tripsService.getAllTrips(req.user.userId);
    // console.log("trips controller after getting all trips = ", trips);
    res.status(200).json(trips);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    err.status = err.status || 500;
    err.message = "Failed to get trips";
    next(err);
  }
}

export async function getById(req, res, next) {
  console.log("getById - src/controllers/trips.controller.js");
  try {
    const trip = await tripsService.getById(req.params.id, req.user.userId);
    log.info(`the trip with id ${req.params.id} returned successfully`);
    // console.log(trip, "this is ther trip");
    res.status(200).json(trip);
  } catch (err) {
    log.warn(`error: ${err.message}`);
    err.status = err.status || 500;
    err.message = "Failed to get trip by id";
    next(err);
  }
}

export async function createTrip(req, res, next) {
  console.log("createTrip - src/controllers/trips.controller.js");
  try {
    const newTrip = await tripsService.addTrip(req.body);
    log.info(`new trip added successfully`);
    res.status(201).json(newTrip);
  } catch (err) {
    log.warn(`creating trip failed`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function updateTrip(req, res, next) {
  console.log("updateTrip - src/controllers/trips.controller.js");
  try {
    log.info(`updateTrip body: ${JSON.stringify(req.body)}`);
    const updatedTrip = await tripsService.updateTrip({
      ...req.body,
      tripId: req.params.id,
    });
    log.info(`update trip successfully, trip id: ${req.params.id}`);
    res.status(200).json(updatedTrip);
  } catch (err) {
    log.warn(`updating trip failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function deleteTrip(req, res, next) {
  console.log("deleteTrip - src/controllers/trips.controller.js");
  try {
    const response = await tripsService.deleteTrip(req.params.id);
    log.info(`trip with id: ${req.params.id} deleted successfully`);
    res.status(201).json("Trip deleted successfully");
  } catch (err) {
    log.warn(`deleting trip failed, from deleteTrip in trips.controller`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function approveTrip(req, res, next) {
  console.log("approveTrip - src/controllers/trips.controller.js");
  try {
    const trip = await tripsService.approveTrip(req.params.id);
    // console.log(trip);
    log.info(`trip with id: ${req.params.id} approved successfully`);
    res.status(201).json(trip);
  } catch (err) {
    log.warn(`approving trip failed: ${err.message}`);
    next(err);
  }
}
export async function addStaff(req, res, next) {
  console.log("addStaff - src/controllers/trips.controller.js");
  try {
    await tripsService.addStaff(req.params.id, req.body.staffAssignments);
    log.info(`staff added to trip: ${req.params.id}`);
    res.status(201).json({ message: "Staff added successfully" });
  } catch (err) {
    log.warn(`adding staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function getAllStaff(req, res, next) {
  console.log("getAllStaff - src/controllers/trips.controller.js");
  try {
    const staff = await tripsService.getAllStaff(req.params.id);
    res.status(201).json(staff);
  } catch (err) {
    log.warn(`getting staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function deleteStaff(req, res, next) {
  console.log("deleteStaff - src/controllers/trips.controller.js");
  try {
    await tripsService.deleteStaff(req.params.id, req.params.userId);
    log.info(`staff ${req.params.userId} removed from trip: ${req.params.id}`);
    res.status(201).json({ message: "Staff deleted successfully" });
  } catch (err) {
    log.warn(`deleting staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function addExternalStaff(req, res, next) {
  console.log("addExternalStaff - src/controllers/trips.controller.js");
  try {
    await tripsService.addExternalStaff(req.params.id, req.body);
    res.status(201).json({ message: "External staff added successfully" });
  } catch (err) {
    log.warn(`adding external staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function deleteExternalStaff(req, res, next) {
  console.log("deleteExternalStaff - src/controllers/trips.controller.js");
  try {
    await tripsService.deleteExternalStaff(req.params.id, req.params.staffId);
    log.info(
      `external staff ${req.params.staffId} removed from trip: ${req.params.id}`,
    );
    res.status(201).json({ message: "External staff deleted successfully" });
  } catch (err) {
    log.warn(`deleting external staff failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}
export async function closeTrip(req, res, next) {
  console.log("closeTrip - src/controllers/trips.controller.js");
  try {
    await tripsService.closeTrip(req.params.id);
    res.status(200).json({ message: "trip closed successfully" });
  } catch (err) {
    next(err);
  }
}

export async function setPostEdit(req, res, next) {
  console.log("setPostEdit - src/controllers/trips.controller.js");
  try {
    await tripsService.setPostEdit(req.params.id, req.body.note);
    res.status(200).json({ message: "הטיול נפתח לעריכה בדיעבד" });
  } catch (err) {
    next(err);
  }
}

// תבניות ריקות לדוגמה לעמוד "דוגמה ומדריך למילוי אוגדן ותיק טיול" — נתון סטטי, ללא פנייה למסד הנתונים
export async function getExampleKitTemplates(req, res, next) {
  console.log("getExampleKitTemplates - src/controllers/trips.controller.js");
  try {
    res.status(200).json(EXAMPLE_KIT_TEMPLATES);
  } catch (err) {
    log.warn(`getting example kit templates failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}

// GET /example-kit/templates/files — מחזיר את רשימת כל הקבצים שקיימים בפועל בתיקיית התבניות לדוגמה
export async function getExampleKitTemplateFiles(req, res, next) {
  console.log(
    "getExampleKitTemplateFiles - src/controllers/trips.controller.js",
  );
  try {
    const dir = getExampleKitTemplatesDir();

    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
      if (err.code === "ENOENT") {
        return res.status(200).json([]);
      }
      throw err;
    }

    const fileNames = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "he"));

    res.status(200).json(fileNames);
  } catch (err) {
    log.warn(`getting example kit template files failed: ${err.message}`);
    err.status = err.status || 500;
    next(err);
  }
}

// GET /example-kit/templates/files/:fileName — מוריד קובץ בודד מתיקיית התבניות לדוגמה
export async function downloadExampleKitTemplateFile(req, res, next) {
  console.log(
    "downloadExampleKitTemplateFile - src/controllers/trips.controller.js",
  );
  try {
    // path.basename מסיר כל מרכיב נתיב (כולל ../) כדי למנוע Path Traversal
    const safeFileName = path.basename(req.params.fileName);
    const filePath = path.join(getExampleKitTemplatesDir(), safeFileName);

    await fs.access(filePath);
    res.download(filePath, safeFileName);
  } catch (err) {
    if (err.code === "ENOENT") {
      err.status = 404;
      err.message = "הקובץ המבוקש לא נמצא בתיקיית התבניות";
    } else {
      err.status = err.status || 500;
    }
    log.warn(`downloading example kit template file failed: ${err.message}`);
    next(err);
  }
}
