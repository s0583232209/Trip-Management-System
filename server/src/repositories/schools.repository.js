import getConnection from "../config/db.js";
import log from "../loggers/file.logger.js";
import dblog from "../loggers/database.logger.js";

export async function getById(id) {
  try {
    log.info(`getById schools called with id: ${id}`);
    const connection = await getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM schools WHERE id = ?;",
      [id],
    );
    if (!rows[0]) throw new Error("בית הספר לא נמצא");
    log.info(`getById schools successful for id: ${id}`);
    return rows[0];
  } catch (err) {
    log.error(`getById schools error: ${err.message}`);
    throw err;
  }
}

export async function updateSchool(id, body, userId) {
  const fields = [];
  const values = [];

  const columnByField = {
    name: "name",
    city: "city",
    street: "street",
    houseNumber: "house_number",
    postalCode: "postal_code",
    contactEmail: "contact_email",
    phone: "phone",
  };

  for (const [field, column] of Object.entries(columnByField)) {
    if (body[field] === undefined) continue;
    fields.push(`${column}=?`);
    values.push(body[field] === "" ? null : body[field]);
  }

  if (fields.length === 0) return true;

  const connection = await getConnection();
  const [result] = await connection.execute(
    `UPDATE schools SET ${fields.join(", ")} WHERE id=?`,
    [...values, id],
  );

  await dblog({
    userId,
    actionType: "update_school",
    tableName: "schools",
    message: `school ${id} updated`,
    newValues: JSON.stringify(body),
  });

  return result.affectedRows > 0;
}
