//this is the DAL
import dblog from "../loggers/database.logger.js";
import log from "../loggers/file.logger.js";
import getConnection from "../config/db.js";
export async function getTripDate(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT trip_date FROM trips WHERE id = ?`,
    [tripId],
  );
  return rows[0] || null;
}
export async function getAll(userId) {
  const connection = await getConnection();
  const res = await connection.execute(
    `SELECT DISTINCT trips.id, trips.title, trips.trip_date, trips.trip_status
    FROM trips
    JOIN staff_trip ON trips.id = staff_trip.trip_id
    WHERE staff_trip.staff_id = ?`,
    [userId],
  );
  log.info(`getAll trips by userId: ${userId}`);
  return res[0];
}
export async function getById(tripId, userId) {
  const connection = await getConnection();
  const res = await connection.execute(
    `SELECT t.*, u.national_id AS tripLeaderNationalId, u.full_name AS tripLeaderFullName
      FROM (SELECT * FROM trips WHERE trips.id = ?) t
      JOIN users u ON u.id = t.trip_leader_id
      JOIN staff_trip ON staff_trip.trip_id = t.id
      WHERE staff_trip.staff_id = ? `,
    [tripId, userId],
  );

  log.info(`getTripById : ${tripId}`);
  return res[0][0];
}
export async function addTrip(tripDetails, staffIdsArray = []) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const tripLeaderDbId = tripDetails.tripLeaderId;
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
    await dblog({
      userId: tripLeaderDbId,
      actionType: "create_trip",
      tableName: "trips",
      message: `trip created with id ${newTripId}`,
      newValues: JSON.stringify({ id: newTripId, ...tripDetails }),
    });
    await connection.execute(
      `INSERT IGNORE INTO user_roles (user_id, role_name) VALUES (?, 'trip leader')`,
      [tripLeaderDbId],
    );
    await dblog({
      userId: tripLeaderDbId,
      actionType: "assign_role",
      tableName: "user_roles",
      message: `role 'trip leader' assigned to user ${tripLeaderDbId}`,
      newValues: JSON.stringify({
        userId: tripLeaderDbId,
        role: "trip leader",
      }),
    });

    // 3. בניית מערך של כל אנשי הצוות שצריכים להשתבץ לטיול (אחראי הטיול + מנהל + רכז)
    // נשתמש ב-Set כדי למנוע כפילויות במקרה שאחראי הטיול הוא גם הרכז
    let coordinatorAndPrincipal = await connection.execute(
      ` SELECT id
     FROM users
      JOIN user_roles ur
      ON ur.user_id=users.id WHERE users.school_id= ? AND( ur.role_name="principal" or ur.role_name="coordinator"); `,
      [tripDetails.schoolId],
    );
    // console.log(coordinatorAndPrincipal[0]);
    coordinatorAndPrincipal = coordinatorAndPrincipal[0].map((item) => item.id);
    // console.log(coordinatorAndPrincipal);
    const allStaffToInsert = new Set([
      tripLeaderDbId,
      ...staffIdsArray,
      ...coordinatorAndPrincipal,
    ]);
    const finalStaffIds = Array.from(allStaffToInsert);

    // 4. הכנסה מרוכזת (Bulk Insert) לטבלת staff_trip
    // אחראי הטיול משובץ גם לכיתה שנבחרה עבורו (אם נבחרה)
    await addStaff(
      newTripId,
      finalStaffIds.map((staffId) => ({
        staffId,
        classId:
          staffId === tripLeaderDbId
            ? tripDetails.tripLeaderClassId || null
            : null,
      })),
    );

    // 5. קישור הכיתות שנוצרו עבור הטיול לטבלת trip_classes,
    // לצורך בדיקת כיסוי כיתות (כל כיתה משובצת = יש לה לפחות מורה אחד) לפני אישור הטיול
    const classIds = tripDetails.classIds || [];
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => "(?, ?)").join(", ");
      const params = [];
      classIds.forEach((classId) => {
        params.push(newTripId, classId);
      });
      await connection.execute(
        `INSERT IGNORE INTO trip_classes (trip_id, class_id) VALUES ${placeholders}`,
        params,
      );
    }

    // console.log(rows, "end of add trip in service");
    await connection.commit();
    return rows;
  } catch (err) {
    await connection.rollback();
    throw err;
  }
}
export async function updateTrip(updateDetails) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // updateDetails.tripLeaderId כבר נפתר (resolved) ל-DB id ע"י trips.service.js
    const [rows] = await connection.execute(
      `UPDATE trips SET trip_leader_id=?, title=?, trip_date=?, route_geojson=? WHERE id=?`,
      [
        updateDetails.tripLeaderId,
        updateDetails.title,
        updateDetails.tripDate || null,
        updateDetails.routeGeoJson || null,
        updateDetails.tripId,
      ],
    );
    await connection.execute(
      `INSERT IGNORE INTO user_roles (user_id, role_name) VALUES (?, 'trip leader')`,
      [updateDetails.tripLeaderId],
    );

    // משבץ את אחראי הטיול החדש גם בטבלת staff_trip,
    // אחרת הוא לא יראה את הטיול ברשימת הטיולים שלו ו-getById שלו ייכשל (INNER JOIN על staff_trip)
    const [existingStaff] = await connection.execute(
      `SELECT 1 FROM staff_trip WHERE trip_id = ? AND staff_id = ? LIMIT 1`,
      [updateDetails.tripId, updateDetails.tripLeaderId],
    );
    if (existingStaff.length === 0) {
      await connection.execute(
        `INSERT INTO staff_trip (staff_id, trip_id) VALUES (?, ?)`,
        [updateDetails.tripLeaderId, updateDetails.tripId],
      );
    }

    await connection.commit();
    // console.log(rows, "rows from update trip repo");
    return rows;
  } catch (err) {
    await connection.rollback();
    throw err;
  }
}
export async function deleteTrip(tripId) {
  const connection = await getConnection();
  const response = await connection.execute(`DELETE FROM trips WHERE id=?`, [
    tripId,
  ]);
  return response;
}
// מאתר כיתות שמשובצות לטיול (trip_classes) אך אין להן אף איש צוות ב-staff_trip
export async function getUncoveredClasses(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT c.id, c.class_name, c.grade
     FROM trip_classes tc
     JOIN classes c ON c.id = tc.class_id
     WHERE tc.trip_id = ?
       AND NOT EXISTS (
         SELECT 1 FROM staff_trip st
         WHERE st.trip_id = tc.trip_id AND st.class_id = tc.class_id
       )`,
    [tripId],
  );
  return rows;
}
export async function approveTrip(tripId, parentToken) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `UPDATE trips SET trip_status=2,parent_token=? WHERE id=?`,
      [parentToken, tripId],
    );
    await connection.commit();
    return rows;
  } catch (err) {
    await connection.rollback();
    throw err;
  }
}
export async function addStaff(tripsId, staffAssignments = []) {
  const connection = await getConnection();
  const newTripId = tripsId;
  // console.log(newTripId);
  // console.log(staffAssignments);

  if (staffAssignments.length > 0) {
    const placeholders = staffAssignments.map(() => "(?, ?, ?)").join(", ");
    const sql = `INSERT IGNORE INTO staff_trip (staff_id, trip_id, class_id) VALUES ${placeholders}`;
    const params = [];
    staffAssignments.forEach(({ staffId, classId }) => {
      params.push(staffId, newTripId, classId ?? null);
    });
    await connection.execute(sql, params);
    await dblog({
      actionType: "add_staff_to_trip",
      tableName: "staff_trip",
      message: `staff [${staffAssignments.map((s) => s.staffId).join(", ")}] added to trip ${newTripId}`,
      newValues: JSON.stringify({ tripId: newTripId, staffAssignments }),
    });
  }
}
export async function deleteStaff(tripId, staffId) {
  const connection = await getConnection();
  const response = await connection.execute(
    `DELETE FROM staff_trip WHERE trip_id = ? AND staff_id = ?`,
    [tripId, staffId],
  );
  return response;
}
export async function getAllStaff(tripId) {
  try {
    const connection = await getConnection();
    const [employees] = await connection.execute(
      `SELECT u.id, u.full_name, u.email, u.phone,
        GROUP_CONCAT(DISTINCT ur.role_name SEPARATOR ', ') AS roles,
        st.class_id, c.class_name
      FROM users u
      JOIN staff_trip st ON u.id = st.staff_id
      JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN classes c ON c.id = st.class_id
      WHERE st.trip_id = ?
      GROUP BY u.id, u.full_name, u.email, u.phone, st.class_id, c.class_name`,
      [tripId],
    );
    const [externalEmployees] = await connection.execute(
      `SELECT e.id, e.name AS full_name, e.phone, er.role_name AS role
      FROM external_employees e
      JOIN external_role er ON e.external_role = er.id
      JOIN external_staff_trip t ON e.id = t.staff_id
      WHERE t.trip_id = ?`,
      [tripId],
    );
    return { employees, externalEmployees };
  } catch (err) {
    throw err;
  }
}
export async function addExternalStaff(tripId, staffDetails) {
  console.log("in add staff, details=", staffDetails.externalStaff[0]);
  staffDetails = staffDetails.externalStaff[0];
  console.log(staffDetails);

  const connection = await getConnection();
  try {
    // const roles = {
    //   guard: 1,
    //   medic: 2,
    //   paramedic: 3,
    //   firstAidProvider:4,
    //   guide:5
    // };
    console.log(staffDetails.role, "role from frontend");
    // console.log(roles[staffDetails.role], "role", staffDetails);
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO external_employees (name,external_role,phone) VALUES ( ?, ?, ?)`,
      [
        staffDetails.fullName,
        Number(staffDetails.role),
        staffDetails.phoneNumber,
      ],
    );
    console.log(result.insertId, "id from add external staff");
    await dblog({
      actionType: "create_external_employee",
      tableName: "external_employees",
      message: `external employee created with id ${result.insertId}`,
      newValues: JSON.stringify({ id: result.insertId, ...staffDetails }),
    });
    const res = await connection.execute(
      `INSERT INTO external_staff_trip (trip_id, staff_id) VALUES (?,?)`,
      [tripId, result.insertId],
    );
    await dblog({
      actionType: "add_external_staff_to_trip",
      tableName: "external_staff_trip",
      message: `external staff ${result.insertId} added to trip ${tripId}`,
      newValues: JSON.stringify({ tripId, staffId: result.insertId }),
    });
    await connection.commit();
  } catch (err) {
    console.log(err);
    await connection.rollback();
    throw err;
  }
}
export async function deleteExternalStaff(tripId, staffId) {
  const connection = await getConnection();
  const response = await connection.execute(
    `DELETE FROM external_staff_trip WHERE trip_id = ? AND staff_id = ?`,
    [tripId, staffId],
  );
  return response;
}
export async function closeTrip(tripId) {
  const connection = await getConnection();
  const [trip_status] = await connection.execute(
    `SELECT trip_status FROM trips WHERE id=?`,
    [tripId],
  );
  if (!trip_status[0]) {
    const err = new Error("הטיול לא נמצא");
    err.status = 404;
    throw err;
  }
  if (trip_status[0].trip_status === 3) {
    const err = new Error("הטיול כבר נסגר");
    err.status = 400;
    throw err;
  }
  if (trip_status[0].trip_status === 1) {
    const err = new Error("לא ניתן לסגור טיול שעדיין לא אושר");
    err.status = 400;
    throw err;
  }
  const [rows] = await connection.execute(
    `UPDATE trips SET trip_status=3 WHERE id=?`,
    [tripId],
  );
  return rows;
}
