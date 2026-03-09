import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const fallbackDatabaseUrl =
  'postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Allow monorepo installs in environments that never build or run the API.
    url: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
});
