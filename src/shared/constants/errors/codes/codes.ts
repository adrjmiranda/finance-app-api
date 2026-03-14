import { SYSTEM_ERRORS } from '#/shared/constants/errors/codes/system.js';
import { USER_ERRORS } from './users.js';

export const ERROR_CODES = {
	...SYSTEM_ERRORS,
	...USER_ERRORS,
} as const;
