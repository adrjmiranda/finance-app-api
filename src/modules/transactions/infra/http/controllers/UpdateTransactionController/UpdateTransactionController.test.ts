import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import {
  TRANSACTION_TYPES,
  transactionsTable,
} from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';

describe('UpdateTransactionController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should update a transaction', async () => {
    const { authenticatedUser, token } = await createAndAuthenticateUser(app);

    const name = faker.string.alpha(16);
    const date = new Date();
    const amount = faker.number.float({ fractionDigits: 2 });
    const type = faker.helpers.arrayElement(TRANSACTION_TYPES);

    const payload = {
      name,
      date,
      amount,
      type,
    };

    const [createdTransaction] = await db
      .insert(transactionsTable)
      .values({
        ...payload,
        amount: String(payload.amount),
        userId: authenticatedUser!.id,
      })
      .returning()
      .execute();

    const response = await app.inject({
      method: 'PATCH',
      url: `/transactions/${createdTransaction!.id}`,
      payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(response.statusCode, 200);

    const body = JSON.parse(response.payload);

    assert.strictEqual(body.transaction.id, createdTransaction!.id);
    assert.strictEqual(body.transaction.name, payload.name);
    assert.strictEqual(Number(body.transaction.amount), payload.amount);
  });

  test('should throw an error if transaction does not exist', async () => {
    const { token } = await createAndAuthenticateUser(app);

    const payload = {
      name: faker.string.alpha(16),
      date: new Date(),
      amount: faker.number.float({ fractionDigits: 2 }),
      type: faker.helpers.arrayElement(TRANSACTION_TYPES),
    };

    const wrongTransactionId = faker.string.uuid();

    const response = await app.inject({
      method: 'PATCH',
      url: `/transactions/${wrongTransactionId}`,
      payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(response.statusCode, 404);

    const body = JSON.parse(response.payload);

    assert.strictEqual(body.code, ERROR_CODES.TRANSACTION_NOT_FOUND);
  });
});
