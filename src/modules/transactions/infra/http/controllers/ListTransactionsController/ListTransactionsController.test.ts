import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';

import { db } from '#/shared/infra/database/drizzle/db.js';
import {
  TRANSACTION_TYPES,
  transactionsTable,
} from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';

describe('ListTransactionsController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should list transactions', async () => {
    const { authenticatedUser, token } = await createAndAuthenticateUser(app);

    const earning = faker.number.float({ fractionDigits: 2 });
    const expense = faker.number.float({ fractionDigits: 2 });
    const investment = faker.number.float({ fractionDigits: 2 });

    const transactionsData = [
      {
        name: faker.string.alpha(16),
        date: new Date(),
        amount: String(expense),
        type: 'expense' as (typeof TRANSACTION_TYPES)[number],
        userId: authenticatedUser!.id,
      },
      {
        name: faker.string.alpha(16),
        date: new Date(),
        amount: String(earning),
        type: 'earning' as (typeof TRANSACTION_TYPES)[number],
        userId: authenticatedUser!.id,
      },
      {
        name: faker.string.alpha(16),
        date: new Date(),
        amount: String(investment),
        type: 'investment' as (typeof TRANSACTION_TYPES)[number],
        userId: authenticatedUser!.id,
      },
    ];

    await db.insert(transactionsTable).values(transactionsData);

    const response = await app.inject({
      method: 'GET',
      url: '/transactions',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(response.statusCode, 200);

    const body = JSON.parse(response.payload);

    assert.strictEqual(body.transactions.length, transactionsData.length);

    assert.deepStrictEqual(
      body.transactions[0].name,
      transactionsData[0]?.name
    );
    assert.deepStrictEqual(
      body.transactions[1].name,
      transactionsData[1]?.name
    );
    assert.deepStrictEqual(
      body.transactions[2].name,
      transactionsData[2]?.name
    );
  });
});
