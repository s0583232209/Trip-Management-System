import { configDotenv } from "dotenv";
import mysql from "mysql2/promise";
import log from "../loggers/file.logger.js";
import dblog from "../loggers/database.logger.js";
configDotenv();
let connectionPromise = null;
export async function connect() {
  // console.log("in connect",connectionPromise==null);
  if (connectionPromise) return connectionPromise;
  connectionPromise = (async () => {
    // console.log("in create connection");
    try {
      const connection = await mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
      });
      log.info(`Connected to MySQL at ${process.env.HOST}`);
      try {
        await connection.query(`USE ${process.env.DATABASE}`);
      } catch {
        connectionPromise = connection;
      }
      return connection;
    } catch (err) {
      log.error(`Database connection failed: ${err.message}`);
      connectionPromise = null;
      throw err;
    }
  })();

  return connectionPromise;
}

export default async function getConnection(createNow = false) {
  // console.log(connectionPromise);
  if (connectionPromise) return connectionPromise;
  if (createNow) return await connect();
  // console.log
  return null;
}
