import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const parts = trimmed.split("=");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "../supabase/migrations");

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("SUPABASE_DB_URL is required in .env.local");
  process.exit(1);
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await client.query(sql);
    console.log("Applied:", file);
  }
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.end();
}
