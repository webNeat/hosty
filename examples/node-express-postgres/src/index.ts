import express from "express";
import { sql } from "./db.js";

const app = express();

app.use(express.json());

app.get("/", async (_, res) => {
  res.json(await sql`select * from tasks`);
});

app.post("/", async (req, res) => {
  const [item] =
    await sql`insert into tasks(content) values(${req.body.content}) returning *`;
  res.json(item);
});

app.listen(process.env.APP_PORT, () => {
  console.log(`app running on port ${process.env.APP_PORT}`);
});
