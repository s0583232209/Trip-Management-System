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
export async function addTrip(tripDetails) {
  const connection = await getConnection();
  const [row] = await connection.execute(
    "SELECT id FROM users WHERE national_id=?",
    [tripDetails.tripLeaderId],
  );
  if (!row) throw "no such user - tring to assign to the trip leader";
  const [rows] = connection.execute(
    `INSERT INTO trips (school_id, trip_leader_id, title, trip_date, trip_status, route_geojson, parent_token) VALUES (?,?,?,?,?,?,?)`,
    [
      tripDetails.schoolId,
      row.id,
      tripDetails.title,
      tripDetails.tripDate,
      tripDetails.tripStatus,
      tripDetails.routeGeoJson,
      tripDetails.parentToken,
    ],
  );
  return rows;
}
export async function updateTrip(updateDetails) {
  const connection = await getConnection();
  const [id] = await connection.execute(
    `SELECT id FROM users WHERE nationalId=?`,
    [updateDetails.tripLeaderNationalId],
  );
  const [row] = await connection.execute(
    `UPDATE trips SET (trip_leader_id,title,trip_date,trip_status,route_geojson)(?,?,?,?,?) WHERE id=?`,
    [
      id,
      updateDetails.title,
      updateDetails.tripStatus,
      updateDetails.routeGeoJson,
    ],
  );
  return row;
}
export async function deleteTrip(tripId) {
  const connection = getConnection();
  const response = connection.execute(`DELETE FROM trips WHERE id=?`, [tirpId]);
  return response;
}
