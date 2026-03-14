import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import * as z from 'zod';

export const updateUserPasswordBodySchema = z
	.object({
		oldPassword: z.string(ERROR_CODES.INVALID_PASSWORD),
		newPassword: z
			.string(ERROR_CODES.INVALID_PASSWORD)
			.min(8, ERROR_CODES.PASSWORD_VERY_SHORT)
			.max(100, ERROR_CODES.PASSWORD_VERY_LONG),
		confirmNewPassword: z
			.string(ERROR_CODES.INVALID_PASSWORD)
			.min(8, ERROR_CODES.PASSWORD_VERY_SHORT)
			.max(100, ERROR_CODES.PASSWORD_VERY_LONG),
	})
	.refine((data) => data.confirmNewPassword === data.newPassword, {
		message: ERROR_CODES.PASSWORD_MISMATCH,
		path: ['confirmNewPassword'],
	});
