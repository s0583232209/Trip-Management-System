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
export async function getById(tripId, userId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT * FROM (SELECT * FROM trips
    WHERE trips.id = ?)t
    JOIN staff_trip ON staff_trip.trip_id=t.id
    WHERE staff_trip.staff_id=?`,
    [tripId, userId],
  );
  //db log!!!!!!!!!!!!!!!!!
  log.info(`getTripById : ${tripId}`);
  return rows;
}
export default async function addTrip(tripDetails) {
  const connection = await getConnection();
  const [row] = connection.execute(
    `INSERT INTO trips (school_id, trip_leader_id, title, trip_date, trip_status, route_geojson, parent_token) VALUES (?,?,?,?,?,?,?)`,
    [
      tripDetails.schoolId,
      tripDetails.tripLeaderId,
      tripDetails.title,
      tripDetails.tripDate,
      tripDetails.tripStatus,
      tripDetails.routeGeoJson,
      tripDetails.parentToken,
    ],
  );
  return row;
}
