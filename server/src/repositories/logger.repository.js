import getConnection from "../config/db.js";
export default async function loggerRepo(log) {
  const connection = await getConnection(true);
  await connection.query("USE trip_manager")
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
  console.log('end of logger repo')
}
// id INT AUTO_INCREMENT PRIMARY KEY,
// user_id INT NULL,
// action_type VARCHAR(100) NOT NULL,
// table_name VARCHAR(100),
// record_id INT,
// old_values LONGTEXT,
// new_values LONGTEXT,
// -- ip_address VARCHAR(45),
// action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
