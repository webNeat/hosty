import { sql } from "./db.js";

await sql`
  create table if not exists tasks (
    id serial primary key,
    content text not null,
    state varchar(20) not null default 'pending'
  );
`;

await sql.end();
console.log(`db migrated`);
