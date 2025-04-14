import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users, transactions } from "../shared/schema";

// Initialize PostgreSQL client
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize drizzle with the pg pool and specific schema tables
export const db = drizzle(pool);