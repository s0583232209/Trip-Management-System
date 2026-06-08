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

  return rows;
};
export async function getUserRolesOnTripDay(userId) {
  log.info("in get users role on trip day");
  const connection = await getConnection(true);
  const [row] = await connection.execute(
    ` 
     SELECT trips.trip_date
     FROM trips
     WHERE trip_leader.id=?
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
    if (!rows[0]) throw new Error("User not found");
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
    if (!rows[0]) throw new Error("User not found");
    log.info(`getById users successful for id: ${id}`);
    return rows[0];
  } catch (err) {
    log.error(`getById users error: ${err.message}`);
    throw err;
  }
}
async function addUserPrincipal(details) {
  try {
    log.info(`addUserPrincipal called for user: ${details.fullName}`);
    const connection = await getConnection();
    const schoolResult = await connection.execute(
      `INSERT INTO schools (name, institution_number, city, contact_email, street, house_number, postal_code) VALUES (?,?,?,?,?,?,?)`,
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
    console.log(schoolResult);
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
    console.log(result, schoolResult);
  } catch (err) {
    console.log(err);
  }
}
export async function addUser(details, principal) {
  let id;
  console.log(details, "this is details from add User");
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    if (principal) {
      id = await addUserPrincipal(details);
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
    }
    console.log(details.role, "this is the role");
    await connection.execute(
      "INSERT INTO user_passwords (user_id, password_hash, is_active) VALUES (?, ?, TRUE);",
      [id, details.password],
    );
    await connection.execute(
      `INSERT INTO user_roles (user_id,role_name)VALUES(?,?)`,
      [id, details.role],
    );
    await connection.commit();
    log.info(`addUser successful, user id: ${id}`);
    return { userId: id, ...details };
  } catch (err) {
    await connection.rollback();
    log.error(`addUser error: ${err.message}`);
    throw err;
  }
}

// export async function updateProfile(id, details) {
//   try {
//     log.info(
//       `updateProfile called for userId: ${details.userId}, details: ${JSON.stringify(details)}`,
//     );
//     const connection = await getConnection();
//     const [result] = await connection.execute(
//       `UPDATE users SET name=?, username=?, phone=?, street=?, city=?, zipcode=?, house_number=? WHERE id=?`,
//       [
//         details.name,
//         details.username,
//         details.phoneNumber,
//         details.street,
//         details.city,
//         details.zipcode,
//         details.house_number ?? null,
//         id,
//       ],
//     );
//     log.info(`updateProfile successful for id: ${id}`);
//     return result.affectedRows > 0;
//   } catch (err) {
//     log.error(`updateProfile error: ${err.message}`);
//     throw err;
//   }
// }

export async function getPasswordByUserId(userId) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT password_hash AS hashedPassword FROM user_passwords WHERE user_id=? AND is_active=TRUE`,
      [userId],
    );
    if (!rows[0]) throw new Error("Password not found");
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
      `INSERT INTO user_passwords (user_id, password_hash, is_active) VALUES (?, ?, TRUE)`,
      [userId, hashedPassword],
    );
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
