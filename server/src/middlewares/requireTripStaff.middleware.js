import getConnection from "../config/db.js";
import log from "../loggers/file.logger.js";

export default async function requireTripStaff(req, res, next) {
  try {
    const userId = req.user.userId;
    const tripId = req.params.id || req.params.tripId;

    const connection = await getConnection(true);
    const [rows] = await connection.execute(
      `SELECT 1 FROM staff_trip WHERE trip_id = ? AND staff_id = ? LIMIT 1`,
      [tripId, userId]
    );

    if (!rows.length) {
      log.warn(`requireTripStaff: user ${userId} is not staff of trip ${tripId}`);
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    log.error(`requireTripStaff error: ${err.message}`);
    return res.status(500).json({ message: "Server error" });
  }
}
