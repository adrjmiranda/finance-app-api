import { defineConfig } from 'drizzle-kit';

import { env } from './src/shared/env/env.js';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/shared/infra/database/drizzle/schemas',
	out: './drizzle',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
