//this is the DAL
import dblog from "../loggers/database.logger.js";
import log from "../loggers/file.logger.js";
import getConnection from "../config/db.js";
import * as usersRepo from "./users.repository.js";
export async function getAll(userId) {
  const connection = await getConnection();
  console.log(userId);
  const res = await connection.execute(
    `SELECT DISTINCT trips.id, trips.title, trips.trip_date, trips.trip_status
    FROM trips
    JOIN staff_trip ON trips.id = staff_trip.trip_id
    WHERE staff_trip.staff_id = ?`,
    [userId],
  );
  // SELECT DISTINCT trips.id, trips.title, trips.trip_date, trips.trip_status, trips.route_geojson
  //   FROM trips
  //   JOIN staff_trip ON trips.id = staff_trip.trip_id
  //   JOIN users ON staff_trip.staff_id = users.id
  //  WHERE users.id = ?
  console.log(res[0], "this is res[0] from repo trips");
  // dblog.info(`getAll trips by userId: ${userId}`); //fix this log
  log.info(`getAll trips by userId: ${userId}`);
  return res[0];
}
export async function getById(tripId, userId) {
  const connection = await getConnection();
  const res = await connection.execute(
    `SELECT t.*, u.national_id AS tripLeaderNationalId
      FROM (SELECT * FROM trips WHERE trips.id = ?) t
      JOIN users u ON u.id = t.trip_leader_id
      JOIN staff_trip ON staff_trip.trip_id = t.id
      WHERE staff_trip.staff_id = ? `,
    [tripId, userId],
  );
  //SELECT * FROM (SELECT * FROM trips
    // WHERE trips.id = ?)t
    // JOIN staff_trip ON staff_trip.trip_id=t.id
    // WHERE staff_trip.staff_id=?
  //db log!!!!!!!!!!!!!!!!!
  log.info(`getTripById : ${tripId}`);
  return res[0][0];
}
export async function addTrip(tripDetails, staffIdsArray = []) {
  const connection = await getConnection();
  try {
    const objectForRow = await connection.execute(
      "SELECT id FROM users WHERE national_id=?",
      [tripDetails.tripLeaderId],
    );
    const row = objectForRow[0];
    if (!row[0]) throw "no such user - tring to assign to the trip leader";
    const tripLeaderDbId = row[0].id;
    const [rows] = await connection.execute(
      `INSERT INTO trips (school_id, trip_leader_id, title, trip_date, trip_status, route_geojson, parent_token) VALUES (?,?,?,?,?,?,?)`,
      [
        tripDetails.schoolId,
        tripLeaderDbId,
        tripDetails.title || null,
        tripDetails.tripDate || null,
        tripDetails.status || null,
        tripDetails.routeGeoJson || null,
        tripDetails.parentToken || null,
      ],
    );
    const newTripId = rows.insertId;

    // 3. בניית מערך של כל אנשי הצוות שצריכים להשתבץ לטיול (אחראי הטיול + מנהל + רכז)
    // נשתמש ב-Set כדי למנוע כפילויות במקרה שאחראי הטיול הוא גם הרכז
    let coordinatorAndPrincipal = await connection.execute(
      ` SELECT id
     FROM users
      JOIN user_roles ur
      ON ur.user_id=users.id WHERE users.school_id= ? AND( ur.role_name="principal" or ur.role_name="coordinator"); `,
      [tripDetails.schoolId],
    );
    console.log(coordinatorAndPrincipal[0]);
    coordinatorAndPrincipal = coordinatorAndPrincipal[0].map((item) => item.id);
    console.log(coordinatorAndPrincipal);
    const allStaffToInsert = new Set([
      tripLeaderDbId,
      ...staffIdsArray,
      ...coordinatorAndPrincipal,
    ]);
    const finalStaffIds = Array.from(allStaffToInsert);

    // 4. הכנסה מרוכזת (Bulk Insert) לטבלת staff_trip
    await addStaff(newTripId, finalStaffIds);

    console.log(rows, "end of add trip in service");
    await connection.commit();
    return rows;
  } catch (err) {
    await connection.rollback();
    throw err;
  }
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
export async function addStaff(tripsId, staffIdsArray = []) {
  const connection = await getConnection();
  const newTripId = tripsId;
  console.log(newTripId);
  console.log(staffIdsArray);

  if (staffIdsArray.length > 0) {
    const placeholders = staffIdsArray.map(() => "(?, ?)").join(", ");
    const sql = `INSERT INTO staff_trip (staff_id, trip_id) VALUES ${placeholders}`;
    const params = [];
    staffIdsArray.forEach((staffId) => {
      params.push(staffId, newTripId);
    });
    await connection.execute(sql, params);
  }
}
