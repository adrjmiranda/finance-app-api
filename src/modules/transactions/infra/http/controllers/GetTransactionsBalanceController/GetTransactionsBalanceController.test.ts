import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';

import { db } from '#/shared/infra/database/drizzle/db.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';

describe('GetTransactionsBalanceController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should return the transactions balance', async () => {
    const { authenticatedUser, token } = await createAndAuthenticateUser(app);

    const earning = faker.number.float({ fractionDigits: 2 });
    const expense = faker.number.float({ fractionDigits: 2 });
    const investment = faker.number.float({ fractionDigits: 2 });
    const balance = Number((earning - expense + investment).toFixed(2));

    await db.insert(transactionsTable).values([
      {
        name: faker.string.alpha(16),
        date: new Date(),
        amount: String(expense),
        type: 'expense',
        userId: authenticatedUser!.id,
      },
      {
        name: faker.string.alpha(16),
        date: new Date(),
        amount: String(earning),
        type: 'earning',
        userId: authenticatedUser!.id,
      },
      {
        name: faker.string.alpha(16),
        date: new Date(),
        amount: String(investment),
        type: 'investment',
        userId: authenticatedUser!.id,
      },
    ]);

    const response = await app.inject({
      method: 'GET',
      url: '/transactions/balances',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(response.statusCode, 200);

    const body = JSON.parse(response.payload);

    assert.deepStrictEqual(body, {
      earnings: earning,
      expenses: expense,
      investments: investment,
      balance,
    });
  });
});
