import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { container } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { makeTransaction } from '#/shared/tests/factories/make-transaction.js';

import { UpdateTransactionService } from './UpdateTransactionService.js';

describe('UpdateTransactionService', () => {
  let updateTransactionService: UpdateTransactionService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();
    updateTransactionService = childContainer.resolve(UpdateTransactionService);
  });

  test('should update a transaction', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([true]),
        }),
      }),
    }));

    const mockUpdatedTransaction = makeTransaction();

    t.mock.method(db, 'update', () => ({
      set: () => ({
        where: () => ({
          returning: () => ({
            execute: () => Promise.resolve([mockUpdatedTransaction]),
          }),
        }),
      }),
    }));

    const { transaction } = await updateTransactionService.execute({
      transactionId: mockUpdatedTransaction.id,
      userId: mockUpdatedTransaction.userId,
      name: mockUpdatedTransaction.name,
      date: mockUpdatedTransaction.date,
      amount: Number(mockUpdatedTransaction.amount),
      type: mockUpdatedTransaction.type,
    });

    assert.strictEqual(mockUpdatedTransaction.id, mockUpdatedTransaction.id);
    assert.strictEqual(transaction?.userId, mockUpdatedTransaction.userId);
    assert.strictEqual(transaction?.name, mockUpdatedTransaction.name);
    assert.strictEqual(transaction?.date, mockUpdatedTransaction.date);
    assert.strictEqual(transaction?.amount, mockUpdatedTransaction.amount);
    assert.strictEqual(transaction?.type, mockUpdatedTransaction.type);
  });

  test('should throw an error if user is not found', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }));

    const mockTransaction = makeTransaction();

    await assert.rejects(
      async () => {
        await updateTransactionService.execute({
          userId: mockTransaction.userId,
          transactionId: mockTransaction.id,
          amount: Number(mockTransaction.amount),
          date: mockTransaction.date,
          name: mockTransaction.name,
          type: mockTransaction.type,
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
