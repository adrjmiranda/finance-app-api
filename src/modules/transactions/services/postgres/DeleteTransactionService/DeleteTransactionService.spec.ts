import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DeleteTransactionService } from './DeleteTransactionService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { makeTransaction } from '#/shared/tests/factories/make-transaction.js';
import { faker } from '@faker-js/faker';

describe('DeleteTransactionService', () => {
  let deleteTransactionService: DeleteTransactionService;

  beforeEach(() => {
    const childContainer = container.createChildContainer();
    deleteTransactionService = childContainer.resolve(DeleteTransactionService);
  });

  test('should delete a transaction', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([true]),
        }),
      }),
    }));

    const mockTransaction = makeTransaction();

    const deleteMock = t.mock.method(db, 'delete', () => ({
      where: () => ({
        returning: () => ({
          execute: () => Promise.resolve([mockTransaction]),
        }),
      }),
    }));

    await deleteTransactionService.execute({
      userId: mockTransaction.userId,
      transactionId: mockTransaction.id,
    });

    assert.strictEqual(deleteMock.mock.callCount(), 1);
  });

  test('should throw an error if user is not found', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }));

    await assert.rejects(
      async () => {
        await deleteTransactionService.execute({
          userId: faker.string.uuid(),
          transactionId: faker.string.uuid(),
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

  test('should throw an error if transaction is not found', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([true]),
        }),
      }),
    }));

    t.mock.method(db, 'delete', () => ({
      where: () => ({
        returning: () => ({
          execute: () => Promise.resolve([]),
        }),
      }),
    }));

    await assert.rejects(
      async () => {
        await deleteTransactionService.execute({
          userId: faker.string.uuid(),
          transactionId: faker.string.uuid(),
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.TRANSACTION_NOT_FOUND);
        assert.strictEqual(error.status, 404);
        return true;
      }
    );
  });
});
