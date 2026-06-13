// tripDay.middleware.js
// מאמת שהמשתמש הוא trip leader והיום הוא יום הטיול
import getConnection from "../config/db.js";
import log from "../loggers/file.logger.js";
import { getTodayInIsrael } from "../utils/date.util.js";

export default async function requireTripDay(req, res, next) {
  console.log("requireTripDay - src/middlewares/tripDay.middleware.js");
  try {
    const userId = req.user.userId;
    const tripId = req.params.id || req.params.tripId;

    const connection = await getConnection(true);
    const [roles] = await connection.execute(
      `SELECT r.role_name FROM user_roles ur JOIN roles r ON ur.role_name = r.role_name WHERE ur.user_id = ?`,
      [userId]
    );

    const roleNames = roles.map((r) => r.role_name);

    // אם המשתמש אינו trip leader — 403
    if (!roleNames.includes("trip leader")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // בדיקה שתאריך הטיול הוא היום
    const [trips] = await connection.execute(
      `SELECT trip_date FROM trips WHERE id = ? AND trip_leader_id = ?`,
      [tripId, userId]
    );

    if (!trips.length) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // trip_date מגיע כבר כמחרוזת "YYYY-MM-DD" (ראו dateStrings ב-db.js), ללא צורך בהמרת אזור זמן
    const tripDate = trips[0].trip_date;
    const today = getTodayInIsrael();

    if (tripDate !== today) {
      log.warn(`requireTripDay: trip date ${tripDate} is not today ${today}`);
      return res.status(403).json({ message: "ניתן לבצע פעולה זו רק ביום הטיול" });
    }

    next();
  } catch (err) {
    log.error(`requireTripDay error: ${err.message}`);
    return res.status(500).json({ message: "Server error" });
  }
}
