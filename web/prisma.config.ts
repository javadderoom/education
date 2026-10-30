import * as path from "path";
import * as dotenv from "dotenv";

// Load root .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
