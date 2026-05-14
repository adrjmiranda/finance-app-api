import * as z from 'zod';

import { TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';

export const listTransactionsResponseSchema = z.array(
  z.object({
    id: z.uuid(),
    userId: z.uuid(),
    name: z.string(),
    amount: z.string(),
    date: z.coerce.date(),
    type: z.enum(TRANSACTION_TYPES),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
);
