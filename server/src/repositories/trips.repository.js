import dblog from "../loggers/database.logger.js";
import log from "../loggers/file.logger.js";
import getConnection from "../config/db.js";
export async function getTripDate(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT trip_date, trip_leader_id FROM trips WHERE id = ?`,
    [tripId],
  );
  return rows[0] || null;
}

export async function isTripTeacherStaff(tripId, userId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT 1 FROM staff_trip st
     JOIN user_roles ur ON ur.user_id = st.staff_id AND ur.role_name = 'teacher'
     WHERE st.trip_id = ? AND st.staff_id = ? LIMIT 1`,
    [tripId, userId],
  );
  return rows.length > 0;
}
export async function getAll(userId) {
  const connection = await getConnection();
  const res = await connection.execute(
    `SELECT DISTINCT trips.id, trips.title, trips.trip_date, trips.trip_status
     FROM trips
     JOIN users u ON u.id = ?
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN staff_trip st ON trips.id = st.trip_id
     WHERE trips.school_id = u.school_id
       AND (ur.role_name IN ('principal','coordinator')
            OR st.staff_id = ?
            OR trips.trip_leader_id = ?)`,
    [userId, userId, userId],
  );
  log.info(`getAll trips by userId: ${userId}`);
  return res[0];
}
export async function getById(tripId, userId) {
  const connection = await getConnection();
  const res = await connection.execute(
    `SELECT t.*, u2.national_id AS tripLeaderNationalId, u2.full_name AS tripLeaderFullName
      FROM (SELECT * FROM trips WHERE trips.id = ?) t
      JOIN users u2 ON u2.id = t.trip_leader_id
      JOIN users u ON u.id = ?
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN staff_trip st ON st.trip_id = t.id AND st.staff_id = u.id
      WHERE t.school_id = u.school_id
        AND (ur.role_name IN ('principal','coordinator')
             OR st.staff_id = ?
             OR t.trip_leader_id = ?)
      LIMIT 1`,
    [tripId, userId, userId, userId],
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

    let coordinatorAndPrincipal = await connection.execute(
      ` SELECT id
     FROM users
      JOIN user_roles ur
      ON ur.user_id=users.id WHERE users.school_id= ? AND( ur.role_name="principal" or ur.role_name="coordinator"); `,
      [tripDetails.schoolId],
    );
    coordinatorAndPrincipal = coordinatorAndPrincipal[0].map((item) => item.id);
    const allStaffToInsert = new Set([
      tripLeaderDbId,
      ...staffIdsArray,
      ...coordinatorAndPrincipal,
    ]);
    const finalStaffIds = Array.from(allStaffToInsert);

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

    const [currentTrip] = await connection.execute(
      `SELECT trip_leader_id FROM trips WHERE id = ?`,
      [updateDetails.tripId],
    );
    const oldLeaderId = currentTrip[0]?.trip_leader_id;

    if (oldLeaderId && oldLeaderId !== updateDetails.tripLeaderId) {
      const [oldLeaderRow] = await connection.execute(
        `SELECT class_id FROM staff_trip WHERE trip_id = ? AND staff_id = ? LIMIT 1`,
        [updateDetails.tripId, oldLeaderId],
      );
      if (!oldLeaderRow[0]?.class_id) {
        await connection.execute(
          `DELETE FROM staff_trip WHERE trip_id = ? AND staff_id = ?`,
          [updateDetails.tripId, oldLeaderId],
        );
      }
    }

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
        st.class_id, c.class_name,
        CASE WHEN t.trip_leader_id = u.id THEN 1 ELSE 0 END AS is_trip_leader
      FROM users u
      JOIN staff_trip st ON u.id = st.staff_id
      JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN classes c ON c.id = st.class_id
      JOIN trips t ON t.id = st.trip_id
      WHERE st.trip_id = ?
      GROUP BY u.id, u.full_name, u.email, u.phone, st.class_id, c.class_name, t.trip_leader_id`,
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
  staffDetails = staffDetails.externalStaff[0];
  const connection = await getConnection();
  try {
   
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO external_employees (name,external_role,phone) VALUES ( ?, ?, ?)`,
      [
        staffDetails.fullName,
        Number(staffDetails.role),
        staffDetails.phoneNumber,
      ],
    );
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
    (err);
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

export async function setPostEdit(tripId, note) {
  ("setPostEdit - src/repositories/trips.repository.js");
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `UPDATE trips SET trip_status=4, post_edit_note=? WHERE id=?`,
    [note, tripId],
  );
  return rows;
}

export async function getTripClasses(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT c.id, c.class_name, c.grade FROM trip_classes tc JOIN classes c ON c.id = tc.class_id WHERE tc.trip_id = ?`,
    [tripId],
  );
  return rows;
}

export async function getSchoolClasses(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT c.id, c.class_name, c.grade FROM classes c
     WHERE c.school_id = (SELECT school_id FROM trips WHERE id = ?)
     ORDER BY c.grade, c.class_name`,
    [tripId],
  );
  return rows;
}

export async function setTripClasses(tripId, classIds) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(`DELETE FROM trip_classes WHERE trip_id = ?`, [tripId]);
    if (classIds.length > 0) {
      const placeholders = classIds.map(() => "(?, ?)").join(", ");
      const params = [];
      classIds.forEach((id) => params.push(tripId, id));
      await connection.execute(`INSERT INTO trip_classes (trip_id, class_id) VALUES ${placeholders}`, params);
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
}

export async function getRouteGeoJson(tripId) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `SELECT route_geojson FROM trips WHERE id = ?`,
    [tripId],
  );
  return rows[0]?.route_geojson ?? null;
}
