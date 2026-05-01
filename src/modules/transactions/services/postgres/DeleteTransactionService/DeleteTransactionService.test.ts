import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { and, eq } from 'drizzle-orm';
import { container } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { createUserAndTransaction } from '#/shared/utils/user-and-transaction-helper.js';

import { DeleteTransactionService } from './DeleteTransactionService.js';

describe('DeleteTransactionService (Integration)', () => {
  let deleteTransactionService: DeleteTransactionService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    deleteTransactionService = childContainer.resolve(DeleteTransactionService);
  });

  test('should delete a transaction', async () => {
    const { user, transaction } = await createUserAndTransaction();

    await assert.doesNotReject(async () => {
      await deleteTransactionService.execute({
        userId: user?.id ?? '',
        transactionId: transaction?.id ?? '',
      });
    });

    const [transactionInDb] = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, user?.id ?? ''),
          eq(transactionsTable.id, transaction?.id ?? '')
        )
      )
      .limit(1);

    assert.ok(!transactionInDb);
  });

  test('should throw an error if user is not found', async () => {
    const { transaction } = await createUserAndTransaction();

    await assert.rejects(
      async () => {
        await deleteTransactionService.execute({
          userId: faker.string.uuid(),
          transactionId: transaction?.id ?? '',
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.message, ERROR_CODES.USER_NOT_FOUND);
        assert.strictEqual(error.status, 404);
        return true;
      }
    );
  });
});
