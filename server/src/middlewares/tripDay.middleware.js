// tripDay.middleware.js
// מאמת שהמשתמש הוא trip leader והיום הוא יום הטיול
import getConnection from "../config/db.js";
import log from "../loggers/file.logger.js";

export default async function requireTripDay(req, res, next) {
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

    const tripDate = new Date(trips[0].trip_date).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

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
