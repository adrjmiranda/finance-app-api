import 'dotenv/config';

import * as z from 'zod';

import { envSchema } from '#/shared/env/schema.js';

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	const msg = 'Invalid environment variables';
	const formattedError = z.treeifyError(_env.error);

	console.error(msg, formattedError);
	throw new Error(msg);
}

export const env = _env.data;
