#!/usr/bin/env node
/**
 * Regenerate src/types/database.ts from Supabase.
 * Requires: npx supabase login (once) OR SUPABASE_ACCESS_TOKEN in env.
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "src", "types", "database.ts");
const projectId = "fhwtlphkwskjuivueqqf";

try {
  const types = execSync(
    `npx --yes supabase@latest gen types typescript --project-id ${projectId} --schema public`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "inherit"] },
  );

  const header = `/**
 * Supabase schema types. Regenerate after migrations:
 * pnpm db:types
 */
`;

  writeFileSync(outPath, header + types);
  console.log(`Wrote ${outPath}`);
} catch (error) {
  console.error(
    "\ndb:types failed. Run: npx supabase login\nOr set SUPABASE_ACCESS_TOKEN in your environment.\n",
  );
  process.exit(1);
}
