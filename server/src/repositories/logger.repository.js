import getConnection from "../config/db.js";
export default async function loggerRepo(log) {
  const connection = await getConnection(true);
  await connection.execute(
    `INSERT INTO audit_log (user_id,action_type,message,table_name,old_values,new_values)VALUES(?,?,?,?,?,?)`,
    [
      log.userId ?? 0,
      log.actionType,
      log.message,
      log.tableName ?? null,
      log.oldValues ?? null,
      log.newValues ?? null,
    ],
  );
}
