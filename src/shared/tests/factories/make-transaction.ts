import {
  TRANSACTION_TYPES,
  type transactionsTable,
} from '#/shared/infra/database/drizzle/schemas/transactions.js';
import type { transactionsBalanceView } from '#/shared/infra/database/drizzle/schemas/transactions.js';

import { faker } from '@faker-js/faker';

type TransactionEntity = typeof transactionsTable.$inferSelect;

export function makeTransaction(
  overrides: Partial<TransactionEntity> = {}
): TransactionEntity {
  const defaults = {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    name: faker.string.alphanumeric(20),
    date: new Date(),
    amount: faker.number.float({ fractionDigits: 2 }).toString(),
    type: faker.helpers.arrayElement(TRANSACTION_TYPES),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaults,
    ...overrides,
  };
}

type BalanceEntity = typeof transactionsBalanceView.$inferSelect;

export function makeBalance(
  overrides: Partial<BalanceEntity> = {}
): BalanceEntity {
  const earnings = faker.number.float({
    min: 1000,
    max: 5000,
    fractionDigits: 2,
  });
  const expenses = faker.number.float({
    min: 100,
    max: 1000,
    fractionDigits: 2,
  });
  const investments = faker.number.float({
    min: 100,
    max: 500,
    fractionDigits: 2,
  });

  return {
    userId: faker.string.uuid(),
    earnings: earnings.toString(),
    expenses: expenses.toString(),
    investments: investments.toString(),
    balance: (earnings - expenses).toString(),
    ...overrides,
  } as BalanceEntity;
}
