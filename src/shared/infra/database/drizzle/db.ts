import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { env } from '#/shared/env/env.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: { ...usersTable, ...transactionsTable },
});
