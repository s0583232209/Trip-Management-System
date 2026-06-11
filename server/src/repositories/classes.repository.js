//this is the DAL
import log from "../loggers/file.logger.js";
import dblog from "../loggers/database.logger.js";
import getConnection from "../config/db.js";

export async function getAllClasses(schoolId) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT id, school_id, class_name, grade
       FROM classes
       WHERE school_id = ?
       ORDER BY school_id ASC, grade ASC, class_name ASC`,
      [schoolId],
    );
    log.info(`getAllClasses returned ${rows.length} classes for school ${schoolId}`);
    return rows;
  } catch (err) {
    log.error(`getAllClasses error: ${err.message}`);
    throw err;
  }
}

export async function addClass(details) {
  try {
    const connection = await getConnection();
    const [result] = await connection.execute(
      `INSERT INTO classes (school_id, class_name, grade) VALUES (?, ?, ?)`,
      [details.schoolId, details.className, details.grade],
    );
    await dblog({
      actionType: "create_class",
      tableName: "classes",
      message: `class created with id ${result.insertId}`,
      newValues: JSON.stringify({
        id: result.insertId,
        schoolId: details.schoolId,
        className: details.className,
        grade: details.grade,
      }),
    });
    log.info(`addClass successful, class id: ${result.insertId}`);
    return {
      id: result.insertId,
      school_id: details.schoolId,
      class_name: details.className,
      grade: details.grade,
    };
  } catch (err) {
    log.error(`addClass error: ${err.message}`);
    throw err;
  }
}
