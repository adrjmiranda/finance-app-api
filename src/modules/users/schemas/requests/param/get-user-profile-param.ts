import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import * as z from 'zod';

export const getUserProfileParam = z.object({
	userId: z.uuid(ERROR_CODES.INVALID_UUID),
});
