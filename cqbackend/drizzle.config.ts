import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema**/*.ts',   // update path as needed
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgres://postgres:admin@localhost:5432/cqmain',
  },
});
