import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import {
  TRANSACTION_TYPES,
  transactionsTable,
} from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';

describe('DeleteTransactionController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should delete a transaction', async () => {
    const { authenticatedUser, token } = await createAndAuthenticateUser(app);

    const [createdTransaction] = await db
      .insert(transactionsTable)
      .values({
        name: faker.string.alpha(16),
        date: new Date(),
        amount: String(faker.number.float({ fractionDigits: 2 })),
        type: faker.helpers.arrayElement(TRANSACTION_TYPES),
        userId: authenticatedUser!.id,
      })
      .returning()
      .execute();

    const transactionId = createdTransaction!.id;

    const response = await app.inject({
      method: 'DELETE',
      url: `/transactions/${transactionId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(response.statusCode, 204);

    const [transactionInDb] = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, transactionId))
      .limit(1);

    assert.ok(!transactionInDb);
  });

  test('should throw an error if transaction does not exist', async () => {
    const { token } = await createAndAuthenticateUser(app);

    const wrongTransactionId = faker.string.uuid();

    const response = await app.inject({
      method: 'DELETE',
      url: `/transactions/${wrongTransactionId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(response.statusCode, 404);

    const body = JSON.parse(response.payload);

    assert.strictEqual(body.code, ERROR_CODES.TRANSACTION_NOT_FOUND);
  });
});
