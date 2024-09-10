import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config();

export const sql = postgres({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  db: process.env.DB_NAME,
});
