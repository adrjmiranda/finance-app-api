import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { makeTransaction } from '#/shared/tests/factories/make-transaction.js';

import { ListTransactionsService } from './ListTransactionsService.js';

describe('ListTransactionsService', () => {
  let listTransactionService: ListTransactionsService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();
    listTransactionService = childContainer.resolve(ListTransactionsService);
  });

  test('should list all transactions', async (t) => {
    const mockUserId = faker.string.uuid();

    const mockTransactions = Array.from({ length: 5 }, (_, i) => i).map((n) =>
      makeTransaction({ name: `Test Transaction ${n}`, userId: mockUserId })
    );

    const selectCalls = t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => {
          if (selectCalls.mock.callCount() === 1) {
            return {
              limit: () => Promise.resolve([true]),
            };
          }

          return Promise.resolve(mockTransactions);
        },
      }),
    }));

    const { transactions } = await listTransactionService.execute({
      userId: mockUserId,
    });

    assert.strictEqual(transactions.length, mockTransactions.length);
    assert.notStrictEqual(transactions, []);
    assert.strictEqual(transactions[0]?.id, mockTransactions[0]?.id);
    assert.strictEqual(transactions[0]?.userId, mockTransactions[0]?.userId);
    assert.strictEqual(transactions[0]?.name, mockTransactions[0]?.name);
    assert.strictEqual(transactions[0]?.date, mockTransactions[0]?.date);
    assert.strictEqual(transactions[0]?.amount, mockTransactions[0]?.amount);
    assert.strictEqual(transactions[0]?.type, mockTransactions[0]?.type);
  });

  test('should throw an error if user is not found', async (t) => {
    const mockUserId = faker.string.uuid();

    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }));

    await assert.rejects(
      async () => {
        await listTransactionService.execute({ userId: mockUserId });
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
