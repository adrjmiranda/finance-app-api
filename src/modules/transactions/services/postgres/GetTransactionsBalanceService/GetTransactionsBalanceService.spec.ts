import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionsBalanceService } from './GetTransactionsBalanceService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { makeBalance } from '#/shared/tests/factories/make-transaction.js';
import { faker } from '@faker-js/faker';

describe('GetTransactionsBalanceService', () => {
  let getTransactionBalanceService: GetTransactionsBalanceService;

  beforeEach(() => {
    const childContainer = container.createChildContainer();
    getTransactionBalanceService = childContainer.resolve(
      GetTransactionsBalanceService
    );
  });

  test('should get transactions balance', async (t) => {
    const mockTransactionBalance = makeBalance();

    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([true]),
          execute: () => Promise.resolve([mockTransactionBalance]),
        }),
      }),
    }));

    const { balance, earnings, expenses, investments } =
      await getTransactionBalanceService.execute({
        userId: faker.string.uuid(),
      });

    assert.strictEqual(Number(mockTransactionBalance.expenses), expenses);
    assert.strictEqual(Number(mockTransactionBalance.earnings), earnings);
    assert.strictEqual(Number(mockTransactionBalance.investments), investments);
    assert.strictEqual(Number(mockTransactionBalance.balance), balance);
  });

  test('should throw an error if user is not found', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
          execute: () => Promise.resolve([true]),
        }),
      }),
    }));

    await assert.rejects(
      async () => {
        await getTransactionBalanceService.execute({
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
});
