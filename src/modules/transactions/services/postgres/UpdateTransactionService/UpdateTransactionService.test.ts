import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { createUserAndTransaction } from '#/shared/utils/user-and-transaction-helper.js';

import { UpdateTransactionService } from './UpdateTransactionService.js';

describe('UpdateTransactionService (Integration)', () => {
  let updateTransactionService: UpdateTransactionService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    updateTransactionService = childContainer.resolve(UpdateTransactionService);
  });

  test('should update a transaction', async () => {
    const { user, transaction } = await createUserAndTransaction();

    const transactionDataToUpdate = {
      userId: user?.id ?? '',
      transactionId: transaction?.id ?? '',
      name: faker.string.alphanumeric(20),
      date: new Date(),
      amount: Number(faker.number.float({ fractionDigits: 2 })),
      type: faker.helpers.arrayElement(TRANSACTION_TYPES),
    };

    const { transaction: updatedTransaction } =
      await updateTransactionService.execute({ ...transactionDataToUpdate });

    assert.ok(updatedTransaction);
    assert.strictEqual(updatedTransaction.id, transaction?.id);
    assert.strictEqual(updatedTransaction.userId, transaction?.userId);
    assert.strictEqual(updatedTransaction.name, transactionDataToUpdate.name);
    assert.strictEqual(
      Number(updatedTransaction.amount),
      transactionDataToUpdate.amount
    );
    assert.strictEqual(
      updatedTransaction.date.toISOString(),
      transactionDataToUpdate.date.toISOString()
    );
  });

  test('should throw an error if user is not found', async () => {
    const { transaction } = await createUserAndTransaction();

    const transactionDataToUpdate = {
      userId: faker.string.uuid(),
      transactionId: transaction?.id ?? '',
      name: faker.string.alphanumeric(20),
      date: new Date(),
      amount: Number(faker.number.float({ fractionDigits: 2 })),
      type: faker.helpers.arrayElement(TRANSACTION_TYPES),
    };

    await assert.rejects(
      async () => {
        await updateTransactionService.execute({ ...transactionDataToUpdate });
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
