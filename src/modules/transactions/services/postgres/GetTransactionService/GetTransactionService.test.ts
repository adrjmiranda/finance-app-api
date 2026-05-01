import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { createUserAndTransaction } from '#/shared/utils/user-and-transaction-helper.js';
import { createUser } from '#/shared/utils/user-helper.js';

import { GetTransactionService } from './GetTransactionService.js';

describe('GetTransactionService (Integration)', () => {
  let getTransactionService: GetTransactionService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    getTransactionService = childContainer.resolve(GetTransactionService);
  });

  test('should get a transaction', async () => {
    const { user, transaction } = await createUserAndTransaction();

    const { transaction: transactionFromDb } =
      await getTransactionService.execute({
        userId: user?.id ?? '',
        transactionId: transaction?.id ?? '',
      });

    assert(transactionFromDb);
    assert.strictEqual(transactionFromDb?.id, transaction?.id);
    assert.strictEqual(transactionFromDb?.userId, transaction?.userId);
    assert.strictEqual(transactionFromDb?.name, transaction?.name);
    assert.strictEqual(
      transactionFromDb?.date.toISOString(),
      transaction?.date.toISOString()
    );
    assert.strictEqual(transactionFromDb?.amount, transaction?.amount);
    assert.strictEqual(transactionFromDb?.type, transaction?.type);
  });

  test('should throw an error if user is not found', async () => {
    const { transaction } = await createUserAndTransaction();

    await assert.rejects(
      async () => {
        await getTransactionService.execute({
          userId: faker.string.uuid(),
          transactionId: transaction?.id ?? '',
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

  test('should throw an error if transaction is not found', async () => {
    const { user } = await createUser();

    await assert.rejects(
      async () => {
        await getTransactionService.execute({
          userId: user?.id ?? '',
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
