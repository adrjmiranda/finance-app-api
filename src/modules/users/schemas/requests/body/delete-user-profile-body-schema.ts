import * as z from 'zod';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

export const deleteUserProfileBodySchema = z.object({
  password: z
    .string(ERROR_CODES.INVALID_PASSWORD)
    .min(8, ERROR_CODES.PASSWORD_VERY_SHORT)
    .max(100, ERROR_CODES.PASSWORD_VERY_LONG),
});
