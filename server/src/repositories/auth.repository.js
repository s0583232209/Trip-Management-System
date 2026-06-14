import getConnection from "../config/db.js";
import log from "../loggers/file.logger.js";

export async function addToken(hashedToken, userId) {
  try {
    log.info(`addToken called for userId: ${userId}`);
    const connection = await getConnection();
    const [result] = await connection.execute(
      "INSERT INTO tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY));",
      [userId, hashedToken],
    );
    return result.affectedRows > 0;
  } catch (err) {
    log.error(`addToken error: ${err.message}`);
    throw err;
  }
}
