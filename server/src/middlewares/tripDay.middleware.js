import getConnection from "../config/db.js";
import log from "../loggers/file.logger.js";
import { getTodayInIsrael } from "../utils/date.util.js";

export default async function requireTripDay(req, res, next) {
  try {
    const userId = req.user.userId;
    const tripId = req.params.id || req.params.tripId;
    const connection = await getConnection(true);
    const [trips] = await connection.execute(
      `SELECT trip_date, trip_leader_id FROM trips WHERE id = ?`,
      [tripId]
    );

    if (!trips.length) {
      log.warn(`requireTripDay: trip ${tripId} not found`);
      return res.status(403).json({ message: "Forbidden" });
    }

    if (String(trips[0].trip_leader_id) !== String(userId)) {
      log.warn(`requireTripDay: user ${userId} is not trip leader (leader=${trips[0].trip_leader_id})`);
      return res.status(403).json({ message: "Forbidden" });
    }

    const tripDate = typeof trips[0].trip_date === "string"
      ? trips[0].trip_date.slice(0, 10)
      : new Date(trips[0].trip_date).toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
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
