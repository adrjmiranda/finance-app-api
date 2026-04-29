import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ListTransactionsService } from './ListTransactionsService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

import { container } from 'tsyringe';

import { createUserAndTransaction } from '#/shared/utils/user-and-transaction-helper.js';

import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { faker } from '@faker-js/faker';

describe('ListTransactionsService (Integration)', () => {
  let listTransactionsService: ListTransactionsService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    listTransactionsService = childContainer.resolve(ListTransactionsService);
  });

  test('should list transactions', async () => {
    const { user, transaction } = await createUserAndTransaction();

    const { transactions } = await listTransactionsService.execute({
      userId: user?.id ?? '',
    });

    assert.strictEqual(transactions.length, 1);
    assert.deepStrictEqual(transaction, transactions[0]);
  });

  test('should throw an error if user is not found', async () => {
    await assert.rejects(
      async () => {
        await listTransactionsService.execute({
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
