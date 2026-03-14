import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import * as z from 'zod';

export const authenticateBodySchema = z.object({
	email: z.email(ERROR_CODES.INVALID_EMAIL),
	password: z
		.string(ERROR_CODES.INVALID_PASSWORD)
		.min(8, ERROR_CODES.PASSWORD_VERY_SHORT)
		.max(100, ERROR_CODES.PASSWORD_VERY_LONG),
});
