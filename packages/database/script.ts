import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:urNEE3eYnQoNZ45e@db.mpfqpueldajpmphahezr.supabase.co:5432/postgres?sslmode=require",
  });
  await client.connect();
  const res = await client.query("SELECT current_schema(), current_schemas(true);");
  console.log(res.rows[0]);

  // Create Prisma schema if it doesn't exist to solve Prisma's issue
  await client.query('CREATE SCHEMA IF NOT EXISTS "prisma";');
  console.log("Created schema 'prisma'");

  await client.end();
}

main().catch(console.error);
