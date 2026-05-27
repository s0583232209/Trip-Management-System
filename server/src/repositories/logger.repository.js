import getConnection from "../config/db.js";
export default async function loggerRepo(log) {
  const connection = getConnection();
  await connection.execute(
    `INSERT INTO audit_log (user_id,action_type,table_name,old_values,new_values,message)VALUES(?,?,?,?,?,?)`,
    [
      log.userId,
      log.actionType || NULL,
      log.tableName || NULL,
      log.oldValues || NULL,
      log.newValues || NULL,
      log.message,
    ],
  );
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
