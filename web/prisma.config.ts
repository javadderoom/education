import * as path from "path";
import * as dotenv from "dotenv";

// Load root .env file for local CLI usage (ignored if already injected in Vercel/CI)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { defineConfig, env } from "prisma/config";

/**
 * Resolves a direct (non-pooled) PostgreSQL URL for Prisma CLI schema operations
 * (`db push`, `migrate`). Neon's pooled PgBouncer endpoint blocks session-level
 * advisory locks required by Prisma schema commands.
 */
function resolveCliDatabaseUrl(): string {
  const directEnv =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DIRECT_URL;
  if (directEnv) {
    return directEnv;
  }

  const rawUrl = env("DATABASE_URL");
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes("-pooler.") && parsed.hostname.endsWith(".neon.tech")) {
      parsed.hostname = parsed.hostname.replace("-pooler.", ".");
      parsed.searchParams.delete("pgbouncer");
      return parsed.toString();
    }
  } catch {
    // Preserve raw DATABASE_URL when it cannot be parsed as a standard URL
  }
  return rawUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: resolveCliDatabaseUrl(),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "node -e \"require('jiti')()('./prisma/seed.ts');\"",
  },
});
