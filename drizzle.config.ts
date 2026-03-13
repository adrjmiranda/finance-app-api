import { defineConfig } from 'drizzle-kit';

import { env } from '#/shared/env';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/shared/infra/database/drizzle/schemas',
	out: './drizzle',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
