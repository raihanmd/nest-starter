import "dotenv/config";
import { defineConfig } from "prisma/config";

const isTest = process.env.NODE_ENV === "test";
const envFile = isTest ? ".env.test" : ".env";

import(`dotenv/config`).then(() => {
  require("dotenv").config({ path: envFile });
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: isTest
      ? process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
      : process.env.DATABASE_URL,
  },
});
