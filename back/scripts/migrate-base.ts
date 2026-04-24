import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "pg";

function loadEnvFromFile() {
  const envPath = resolve(process.cwd(), ".env");
  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const idx = trimmed.indexOf("=");
    if (idx === -1) {
      continue;
    }

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFromFile();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const check = await client.query<{ table_name: string | null }>(
      "SELECT to_regclass('public.\"User\"') AS table_name;",
    );

    if (check.rows[0]?.table_name) {
      console.log("Base migration already applied, skipping.");
      return;
    }

    const migrationPath = resolve(
      process.cwd(),
      "prisma/migrations/20260423100000_init/migration.sql",
    );
    const migrationSql = readFileSync(migrationPath, "utf8");

    await client.query("BEGIN");
    await client.query(migrationSql);
    await client.query("COMMIT");

    console.log("Base migration applied successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
