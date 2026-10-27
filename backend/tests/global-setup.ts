import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

// Fresh throwaway database for every test run: delete the file, then apply migrations.
export default function setup() {
  for (const file of ["test.db", "test.db-journal"]) rmSync(file, { force: true });
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "pipe",
  });
}
