import * as z from 'zod';

export const getTransactionsBalanceResponseSchema = z.object({
  earnings: z.number(),
  expenses: z.number(),
  investments: z.number(),
  balance: z.number(),
});
