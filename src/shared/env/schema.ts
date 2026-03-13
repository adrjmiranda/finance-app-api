import * as z from 'zod';

export const envSchema = z.object({
	SERVER_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
	SERVER_PORT: z.coerce.number().default(3333),
	DATABASE_URL: z.url(),
});
