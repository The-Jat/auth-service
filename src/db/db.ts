import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config(); // <--- make sure this is here

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // must be defined
});

export const db = drizzle(pool);

