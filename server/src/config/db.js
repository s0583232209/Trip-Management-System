import { configDotenv } from "dotenv";
import mysql from "mysql2/promise";
import log from "../loggers/file.logger.js";
configDotenv();

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  dateStrings: ["DATE"],
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on("connection", () => log.info("MySQL pool: new connection created"));

export async function connect() {
  await pool.query("SELECT 1");
  log.info(`Connected to MySQL pool at ${process.env.HOST}`);
}

export default async function getConnection() {
  const connection = await pool.getConnection();
  return connection;
}
