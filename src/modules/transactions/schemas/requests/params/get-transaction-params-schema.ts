import * as z from 'zod';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

export const getTransactionParamsSchema = z.object({
	transactionId: z.uuid(ERROR_CODES.INVALID_UUID),
});
