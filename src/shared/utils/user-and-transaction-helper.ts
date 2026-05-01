import { faker } from '@faker-js/faker';

import { db } from '#/shared/infra/database/drizzle/db.js';
import {
  TRANSACTION_TYPES,
  transactionsTable,
} from '#/shared/infra/database/drizzle/schemas/transactions.js';

import { createUser } from './user-helper.js';

export async function createUserAndTransaction() {
  const { user } = await createUser();

  const [transaction] = user
    ? await db
        .insert(transactionsTable)
        .values({
          userId: user.id,
          name: faker.string.alphanumeric(20),
          date: new Date(),
          amount: String(faker.number.float({ fractionDigits: 2 })),
          type: faker.helpers.arrayElement(TRANSACTION_TYPES),
        })
        .returning()
        .execute()
    : [undefined];

  return { user, transaction };
}
