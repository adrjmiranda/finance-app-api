import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import * as z from 'zod';

export const createTransactionBodySchema = z.object({
	name: z
		.string(ERROR_CODES.INVALID_NAME)
		.transform((value) => value.trim().replace(/\s+/g, ' '))
		.pipe(
			z
				.string(ERROR_CODES.INVALID_NAME)
				.nonempty(ERROR_CODES.INVALID_NAME)
				.min(3, ERROR_CODES.NAME_VERY_SHORT)
				.max(100, ERROR_CODES.NAME_VERY_LONG)
				.regex(/^[a-zA-ZÀ-ÿ]+$/, ERROR_CODES.INVALID_NAME)
		),

	date: z.coerce.date(ERROR_CODES.INVALID_DATE),

	amount: z
		.number(ERROR_CODES.INVALID_AMOUNT)
		.gt(0, ERROR_CODES.AMOUNT_VERY_LOW)
		.max(99999999.99, ERROR_CODES.AMOUNT_VERY_LARGE)
		.multipleOf(0.01, ERROR_CODES.INVALID_AMOUNT),

	type: z.enum(
		['earning', 'expense', 'investment'],
		ERROR_CODES.INVALID_TRANSACTION_TYPE
	),
});
