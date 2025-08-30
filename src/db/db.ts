import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined, please set it in your environment variables',
  );
}

const dbUrl = `${process.env.DATABASE_URL}_${process.env.NODE_ENV}`;

export const db = drizzle(dbUrl, { schema });
