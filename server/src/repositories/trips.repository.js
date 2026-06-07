//this is the DAL
import dblog from "../loggers/database.logger.js";
import log from "../loggers/file.logger.js";
import getConnection from "../config/db.js";
import * as usersRepo from "./users.repository.js";
export async function getAll(userId) {
  const connection = await getConnection();
  console.log(userId);
  const res = await connection.execute(
    `SELECT * FROM trips
    JOIN staff_trip ON trips.id = staff_trip.trip_id
    JOIN users ON staff_trip.staff_id = users.id
   WHERE users.id = ? `,
    [userId],
  );
  console.log(res, "this is res from repo service");
  // dblog.info(`getAll trips by userId: ${userId}`); //fix this log
  log.info(`getAll trips by userId: ${userId}`);
  return res;
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
  const objectForRow = await connection.execute(
    "SELECT id FROM users WHERE national_id=?",
    [tripDetails.tripLeaderId],
  );
  const row = objectForRow[0];
  if (!row[0]) throw "no such user - tring to assign to the trip leader";
  const [rows] = await connection.execute(
    `INSERT INTO trips (school_id, trip_leader_id, title, trip_date, trip_status, route_geojson, parent_token) VALUES (?,?,?,?,?,?,?)`,
    [
      tripDetails.schoolId,
      row[0].id,
      tripDetails.title || null,
      tripDetails.tripDate || null,
      tripDetails.status || null,
      tripDetails.routeGeoJson || null,
      tripDetails.parentToken || null,
    ],
  );
  const x = await connection.execute(
    `INSERT INTO staff_trip (staff_id, trip_id) VALUES (?, ?)`,
    [tripDetails.staffIds, rows.insertId],
  );
  console.log(rows, "end of add trip in service");
  return rows;
}
export async function updateTrip(updateDetails) {
  const connection = await getConnection();
  console.log(updateDetails, "updateDetails in repo");
  const { id } = await usersRepo.getByNationalId(
    updateDetails.tripLeaderNationalId,
  );
  console.log(updateDetails, "update details,", id, "id");
  const [rows] = await connection.execute(
    `UPDATE trips SET trip_leader_id=?, title=?, trip_date=?, route_geojson=? WHERE id=?`,
    [
      id,
      updateDetails.title,
      updateDetails.tripDate || null,
      updateDetails.routeGeoJson || null,
      updateDetails.tripId,
    ],
  );
  console.log(rows, "rows from update trip repo");
  return rows;
}
export async function deleteTrip(tripId) {
  const connection = await getConnection();
  const response = connection.execute(`DELETE FROM trips WHERE id=?`, [tripId]);
  return response;
}
export async function approveTrip(tripId, parentToken) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `UPDATE trips SET trip_status=2,parent_token=? WHERE id=?`,
    [parentToken, tripId],
  );
  return rows;
}
