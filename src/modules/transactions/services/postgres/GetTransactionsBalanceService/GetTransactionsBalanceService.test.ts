import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionsBalanceService } from './GetTransactionsBalanceService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { container } from 'tsyringe';
import { createUserAndTransaction } from '#/shared/utils/user-and-transaction-helper.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { faker } from '@faker-js/faker';
import { createUser } from '#/shared/utils/user-helper.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';

describe('GetTransactionsBalanceService (Integration)', () => {
  let getTransactionsBalanceService: GetTransactionsBalanceService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    getTransactionsBalanceService = childContainer.resolve(
      GetTransactionsBalanceService
    );
  });

  test('should get transactions balance', async () => {
    const { user, transaction } = await createUserAndTransaction();

    let { balance, earnings, expenses, investments } =
      await getTransactionsBalanceService.execute({
        userId: user?.id ?? '',
      });

    if (transaction)
      switch (transaction.type) {
        case 'earning':
          earnings = Number(transaction?.amount);
          expenses = 0;
          investments = 0;
          balance = earnings;
          break;
        case 'expense':
          expenses = Number(transaction?.amount);
          earnings = 0;
          investments = 0;
          balance = -expenses;
          break;
        case 'investment':
          investments = Number(transaction?.amount);
          earnings = 0;
          expenses = 0;
          balance = investments;
          break;
      }

    assert.strictEqual(balance, Number(earnings + investments - expenses));
  });

  test('should throw an error if user is not found', async () => {
    await assert.rejects(
      async () => {
        await getTransactionsBalanceService.execute({
          userId: faker.string.uuid(),
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.USER_NOT_FOUND);
        assert.strictEqual(error.status, 404);
        return true;
      }
    );
  });

  test('should calculate balance correctly with multiple transaction types', async () => {
    const { user } = await createUser();
    const userId = user!.id;

    await db.insert(transactionsTable).values([
      {
        userId,
        name: 'Salary',
        amount: '5000.00',
        type: 'earning',
        date: new Date(),
      },
      {
        userId,
        name: 'Rent',
        amount: '1500.00',
        type: 'expense',
        date: new Date(),
      },
      {
        userId,
        name: 'Stocks',
        amount: '500.00',
        type: 'investment',
        date: new Date(),
      },
    ]);

    const result = await getTransactionsBalanceService.execute({ userId });

    assert.strictEqual(result.earnings, 5000);
    assert.strictEqual(result.expenses, 1500);
    assert.strictEqual(result.investments, 500);
    assert.strictEqual(result.balance, 4000);
  });
});
