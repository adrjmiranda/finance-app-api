import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CreateTransactionService } from './CreateTransactionService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

import { makeTransaction } from '#/shared/tests/factories/make-transaction.js';

describe('CreateTransactionService', () => {
  let createTransactionService: CreateTransactionService;

  beforeEach(() => {
    const childContainer = container.createChildContainer();
    createTransactionService = childContainer.resolve(CreateTransactionService);
  });

  test('should create a new transaction', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([true]),
        }),
      }),
    }));

    const mockCreatedTransaction = makeTransaction();

    t.mock.method(db, 'insert', () => ({
      values: () => ({
        returning: () => ({
          execute: () => Promise.resolve([mockCreatedTransaction]),
        }),
      }),
    }));

    const { transaction } = await createTransactionService.execute({
      name: mockCreatedTransaction.name,
      date: mockCreatedTransaction.date,
      amount: Number(mockCreatedTransaction.amount),
      userId: mockCreatedTransaction.userId,
      type: mockCreatedTransaction.type,
    });

    assert.strictEqual(transaction?.id, mockCreatedTransaction.id);
    assert.strictEqual(transaction?.userId, mockCreatedTransaction.userId);
    assert.strictEqual(transaction?.name, mockCreatedTransaction.name);
    assert.strictEqual(transaction?.date, mockCreatedTransaction.date);
    assert.strictEqual(transaction?.amount, mockCreatedTransaction.amount);
    assert.strictEqual(transaction?.type, mockCreatedTransaction.type);
  });

  test('should throw an error if user is not found', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }));

    const { userId, name, date, amount, type } = makeTransaction();
    const mockPayload = { userId, name, date, amount: Number(amount), type };

    await assert.rejects(
      async () => {
        await createTransactionService.execute({
          ...mockPayload,
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
