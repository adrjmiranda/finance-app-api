import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { and, eq } from 'drizzle-orm';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import {
  TRANSACTION_TYPES,
  transactionsTable,
} from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';

describe('CreateTransactionController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should create a new transaction', async () => {
    const transactionPayload = {
      name: faker.string.alpha(16),
      date: new Date(),
      amount: faker.number.float({ fractionDigits: 2 }),
      type: faker.helpers.arrayElement(TRANSACTION_TYPES),
    };

    const { authenticatedUser, token } = await createAndAuthenticateUser(app);

    const response = await app.inject({
      method: 'POST',
      payload: transactionPayload,
      url: '/transactions',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = JSON.parse(response.payload);

    const { transaction } = body;

    assert.strictEqual(response.statusCode, 201);

    assert.ok(transaction);

    assert.strictEqual(transaction.userId, authenticatedUser?.id);
    assert.strictEqual(transaction.name, transactionPayload.name);
    assert.strictEqual(Number(transaction.amount), transactionPayload.amount);

    const [transactionInDb] = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, transaction.userId),
          eq(transactionsTable.id, transaction.id)
        )
      )
      .limit(1);

    assert.ok(transactionInDb);
  });

  test('should throw an error if body is invalid', async () => {
    const transactionPayload = {
      name: faker.string.alpha(16),
      date: new Date(),
      amount: faker.string.alpha(16),
      type: faker.string.alphanumeric(16),
    };

    const { authenticatedUser, token } = await createAndAuthenticateUser(app);
    const userId = authenticatedUser?.id ?? faker.string.uuid();

    const response = await app.inject({
      method: 'POST',
      payload: transactionPayload,
      url: '/transactions',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = JSON.parse(response.payload);

    assert.strictEqual(response.statusCode, 400);

    assert.strictEqual(body.code, 'VALIDATION_ERROR');
    assert.strictEqual(body.errors.amount, ERROR_CODES.INVALID_AMOUNT);
    assert.strictEqual(body.errors.type, ERROR_CODES.INVALID_TRANSACTION_TYPE);

    const [transactionInDb] = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .limit(1);

    assert.ok(!transactionInDb);
  });
});
