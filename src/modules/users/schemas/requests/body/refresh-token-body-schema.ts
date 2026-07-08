import * as z from 'zod';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

export const refreshTokenBodySchema = z.object({
  refreshToken: z
    .string(ERROR_CODES.INVALID_REFRESH_TOKEN)
    .min(1, ERROR_CODES.INVALID_REFRESH_TOKEN),
});
