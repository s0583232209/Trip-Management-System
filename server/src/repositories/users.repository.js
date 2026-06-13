//this is the DAL
// dal/users.dal.js

import getConnection from "../config/db.js";
import log from "../loggers/file.logger.js";
import dblog from "../loggers/database.logger.js";

export const getUserRoles = async (userId) => {
  const connection = await getConnection(true);
  const [rows] = await connection.execute(
    `
      SELECT r.role_name
      FROM user_roles ur
      JOIN roles r
      ON ur.role_name = r.role_name
      WHERE ur.user_id = ?
    `,
    [userId],
  );
  if (!rows || rows.length === 0) return [];
  return rows;
};
export async function getUserRolesOnTripDay(userId) {
  log.info("in get users role on trip day");
  const connection = await getConnection(true);
  const [row] = await connection.execute(
    ` 
     SELECT trips.trip_date
     FROM trips
     WHERE trip_leader_id=?
    `,
    [userId],
  );
  //check this function
  return row[0].trip_date;
}
export async function getByNationalId(nationalId) {
  try {
    console.log("get by national id repository");
    log.info(`getById users called with national id: ${nationalId}`);
    const connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE national_id = ?;",
      [nationalId],
    );
    if (!rows[0]) throw new Error("משתמש לא נמצא");
    log.info(`getById users successful for national id: ${nationalId}`);
    return rows[0];
  } catch (err) {
    log.error(`getById users error: ${err.message}`);
    throw err;
  }
}
export async function getById(id) {
  try {
    console.log("get by id repository");
    log.info(`getById users called with id: ${id}`);
    const connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE id = ?;",
      [id],
    );
    if (!rows[0]) throw new Error("משתמש לא נמצא");
    log.info(`getById users successful for id: ${id}`);
    return rows[0];
  } catch (err) {
    log.error(`getById users error: ${err.message}`);
    throw err;
  }
}
async function addUserPrincipal(details, connection) {
  log.info(`addUserPrincipal called for user: ${details.fullName}`);
  const schoolResult = await connection.execute(
    `INSERT IGNORE INTO schools (name, institution_number, city, contact_email, street, house_number, postal_code) VALUES (?,?,?,?,?,?,?)`,
    [
      details.name,
      details.institutionNumber,
      details.city,
      details.email,
      details.street || null,
      details.houseNumber || null,
      details.postalCode || null,
    ],
  );
  await dblog({
    actionType: "create_school",
    tableName: "schools",
    message: `school created/ensured: ${details.name}`,
    newValues: JSON.stringify({
      name: details.name,
      institutionNumber: details.institutionNumber,
      city: details.city,
      email: details.email,
    }),
  });
  const [result] = await connection.execute(
    "INSERT INTO users (school_id,full_name, national_id, email, phone) VALUES (?,?,?,?,?);",
    [
      schoolResult[0].insertId,
      details.fullName,
      details.nationalId,
      details.userEmail || null,
      details.userPhoneNumber || null,
    ],
  );
  await dblog({
    userId: result.insertId,
    actionType: "create_user",
    tableName: "users",
    message: `user created with id ${result.insertId}`,
    newValues: JSON.stringify({
      id: result.insertId,
      schoolId: schoolResult[0].insertId,
      fullName: details.fullName,
      nationalId: details.nationalId,
      email: details.userEmail || null,
      phone: details.userPhoneNumber || null,
    }),
  });
  return result.insertId;
}
export async function addUser(details, principal) {
  let id;
  console.log(details, "this is details from add User");
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    if (principal) {
      id = await addUserPrincipal(details, connection);
    } else {
      const [result] = await connection.execute(
        "INSERT INTO users (school_id,full_name, national_id, email, phone) VALUES (?,?,?,?,?);",
        [
          details.schoolId,
          details.fullName,
          details.nationalId,
          details.userEmail || null,
          details.userPhoneNumber || null,
        ],
      );
      console.log(result, "result from else add user");
      id = result.insertId;
      console.log(id, "this is the new id");
      await dblog({
        userId: id,
        actionType: "create_user",
        tableName: "users",
        message: `user created with id ${id}`,
        newValues: JSON.stringify({
          id,
          schoolId: details.schoolId,
          fullName: details.fullName,
          nationalId: details.nationalId,
          email: details.userEmail || null,
          phone: details.userPhoneNumber || null,
        }),
      });
    }
    console.log(details.role, "this is the role");
    await connection.execute(
      "INSERT IGNORE INTO user_passwords (user_id, password_hash, is_active) VALUES (?, ?, TRUE);",
      [id, details.password],
    );
    await dblog({
      userId: id,
      actionType: "create_password",
      tableName: "user_passwords",
      message: `password created for user ${id}`,
    });
    await connection.execute(
      `INSERT IGNORE INTO user_roles (user_id,role_name)VALUES(?,?)`,
      [id, details.role],
    );
    await dblog({
      userId: id,
      actionType: "assign_role",
      tableName: "user_roles",
      message: `role '${details.role}' assigned to user ${id}`,
      newValues: JSON.stringify({ userId: id, role: details.role }),
    });
    await connection.commit();
    log.info(`addUser successful, user id: ${id}`);
    return { userId: id, ...details };
  } catch (err) {
    await connection.rollback();
    log.error(`addUser error: ${err.message}`);
    throw err;
  }
}

export async function updateProfile(id, body) {
  const fields = [];
  const values = [];
  const fullName = body.fullName;
  const email = body.userEmail;
  const phone = body.userPhoneNumber;
  if (fullName !== undefined) {
    fields.push("full_name=?");
    values.push(fullName);
  }
  if (email !== undefined) {
    fields.push("email=?");
    values.push(email);
  }
  if (phone !== undefined) {
    fields.push("phone=?");
    values.push(phone);
  }
  if (fields.length === 0) return true;
  try {
    log.info(`updateProfile called for userId: ${id}`);
    const connection = await getConnection();
    const [result] = await connection.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id=?`,
      [...values, id],
    );
    await dblog({
      userId: id,
      actionType: "update_profile",
      tableName: "users",
      message: `profile updated for user ${id}`,
      newValues: JSON.stringify(body),
    });
    log.info(`updateProfile successful for id: ${id}`);
    return result.affectedRows > 0;
  } catch (err) {
    log.error(`updateProfile error: ${err.message}`);
    throw err;
  }
}

export async function getPasswordByUserId(userId) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT password_hash AS hashedPassword FROM user_passwords WHERE user_id=? AND is_active=TRUE`,
      [userId],
    );
    if (!rows[0]) throw new Error("סיסמה לא נמצאה");
    return rows[0];
  } catch (err) {
    log.error(`getPasswordByUserId error: ${err.message}`);
    throw err;
  }
}

export async function getAllPasswordsByUserId(userId) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT password_hash AS hashedPassword FROM user_passwords WHERE user_id=?`,
      [userId],
    );
    return rows;
  } catch (err) {
    log.error(`getAllPasswordsByUserId error: ${err.message}`);
    throw err;
  }
}

// export async function updateUsername(id, username) {
//   try {
//     const connection = await getConnection();
//     const [result] = await connection.execute(
//       `UPDATE users SET username=? WHERE id=?`,
//       [username, id],
//     );
//     return result.affectedRows > 0;
//   } catch (err) {
//     log.error(`updateUsername error: ${err.message}`);
//     throw err;
//   }
// }

export async function updatePassword(userId, hashedPassword) {
  try {
    const connection = await getConnection();
    await connection.beginTransaction();
    await connection.execute(
      `UPDATE user_passwords SET is_active=FALSE WHERE user_id=?`,
      [userId],
    );
    const [result] = await connection.execute(
      `INSERT IGNORE INTO user_passwords (user_id, password_hash, is_active) VALUES (?, ?, TRUE)`,
      [userId, hashedPassword],
    );
    await dblog({
      userId,
      actionType: "update_password",
      tableName: "user_passwords",
      message: `password updated for user ${userId}`,
    });
    await connection.commit();
    return result.affectedRows > 0;
  } catch (err) {
    const connection = await getConnection();
    await connection.rollback();
    log.error(`updatePassword error: ${err.message}`);
    throw err;
  }
}

export async function getUserById(nationalId, institutionNumber) {
  const connection = await getConnection();
  const [rows] = await connection.execute(
    `
    SELECT
    user_passwords.password_hash AS hashedPassword,
    user_passwords.user_id AS userId
    FROM users
    JOIN user_passwords ON users.id = user_passwords.user_id
    JOIN user_roles ON users.id = user_roles.user_id
    JOIN schools ON schools.id=users.school_id
    WHERE schools.institution_number=? AND users.national_id = ? AND user_passwords.is_active=TRUE;`,
    [institutionNumber, nationalId],
  );
  return rows[0];
}
export async function getAllUsers(userId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT users.id as user_id, users.full_name, users.email, users.phone,
        GROUP_CONCAT(DISTINCT user_roles.role_name SEPARATOR ', ') AS roles,
        GROUP_CONCAT(DISTINCT trips.title ORDER BY trips.id SEPARATOR ', ') AS led_trips
 FROM users
 LEFT JOIN user_roles ON user_roles.user_id = users.id
 LEFT JOIN trips ON trips.trip_leader_id = users.id
 WHERE users.school_id = (SELECT school_id FROM users WHERE users.id = ?)
 GROUP BY users.id, users.full_name, users.email, users.phone;`,
      [userId],
    );
    return rows;
  } catch (err) {
    throw err;
  }
}

export async function deleteUser(id) {
  try {
    const connection = await getConnection();
    const [result] = await connection.execute(
      `DELETE FROM users WHERE id = ?`,
      [id],
    );
    if (result.affectedRows === 0) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    await dblog({
      userId: id,
      actionType: "delete_user",
      tableName: "users",
      message: `user ${id} deleted`,
    });
    log.info(`deleteUser successful for id: ${id}`);
    return result;
  } catch (err) {
    log.error(`deleteUser error: ${err.message}`);
    throw err;
  }
}

export async function updateUserRole(id, roleName) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(`DELETE FROM user_roles WHERE user_id = ?`, [id]);
    await connection.execute(
      `INSERT INTO user_roles (user_id, role_name) VALUES (?, ?)`,
      [id, roleName],
    );
    await dblog({
      userId: id,
      actionType: "update_role",
      tableName: "user_roles",
      message: `role for user ${id} set to '${roleName}'`,
      newValues: JSON.stringify({ userId: id, role: roleName }),
    });
    await connection.commit();
    log.info(`updateUserRole successful for id: ${id}, role: ${roleName}`);
    return { userId: id, role: roleName };
  } catch (err) {
    await connection.rollback();
    log.error(`updateUserRole error: ${err.message}`);
    throw err;
  }
}

export async function addUserRole(id, roleName) {
  const connection = await getConnection();
  try {
    await connection.execute(
      `INSERT IGNORE INTO user_roles (user_id, role_name) VALUES (?, ?)`,
      [id, roleName],
    );
    await dblog({
      userId: id,
      actionType: "add_role",
      tableName: "user_roles",
      message: `role '${roleName}' added to user ${id}`,
      newValues: JSON.stringify({ userId: id, role: roleName }),
    });
    log.info(`addUserRole successful for id: ${id}, role: ${roleName}`);
    return { userId: id, role: roleName };
  } catch (err) {
    log.error(`addUserRole error: ${err.message}`);
    throw err;
  }
}

export async function removeUserRole(id, roleName) {
  const connection = await getConnection();
  try {
    await connection.execute(
      `DELETE FROM user_roles WHERE user_id = ? AND role_name = ?`,
      [id, roleName],
    );
    await dblog({
      userId: id,
      actionType: "remove_role",
      tableName: "user_roles",
      message: `role '${roleName}' removed from user ${id}`,
      newValues: JSON.stringify({ userId: id, role: roleName }),
    });
    log.info(`removeUserRole successful for id: ${id}, role: ${roleName}`);
    return { userId: id, role: roleName };
  } catch (err) {
    log.error(`removeUserRole error: ${err.message}`);
    throw err;
  }
}
