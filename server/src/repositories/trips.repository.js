//this is the DAL
import dblog from "../loggers/database.logger.js";
import log from "../loggers/file.logger.js";
import getConnection from "../config/db.js";
export async function getAll(userId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT * FROM trips
    JOIN staff_trip ON trips.id = staff_trip.trip_id
    JOIN users ON staff_trip.staff_id = users.id
    WHERE users.id = ?`,
    [userId],
  );
  // dblog.info(`getAll trips by userId: ${userId}`); //fix this log
  log.info(`getAll trips by userId: ${userId}`);
  return rows;
}
