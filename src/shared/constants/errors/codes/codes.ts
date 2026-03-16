import { SYSTEM_ERRORS } from '#/shared/constants/errors/codes/system.js';
import { USER_ERRORS } from '#/shared/constants/errors/codes/users.js';
import { TRANSACTION_ERROR } from '#/shared/constants/errors/codes/transactions.js';

export const ERROR_CODES = {
	...SYSTEM_ERRORS,
	...USER_ERRORS,
	...TRANSACTION_ERROR,
} as const;
