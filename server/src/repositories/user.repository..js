//this is the DAL
// dal/users.dal.js

import pool from "../config/db.js";

export const getUserRoles = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT r.role_name
    FROM user_roles ur
    JOIN roles r
      ON ur.role_id = r.id
    WHERE ur.user_id = ?
    `,
    [userId],
  );

  return rows;
};
