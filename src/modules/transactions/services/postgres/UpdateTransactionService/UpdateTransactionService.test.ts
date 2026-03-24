import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import { UpdateTransactionService } from './UpdateTransactionService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

import { randomUUID } from 'node:crypto';

import { container } from 'tsyringe';

import { createUserAndTransaction } from '#/shared/utils/user-and-transaction-helper.js';

import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

import { type TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';

describe('UpdateTransactionService (Integration)', () => {
	let updateTransactionService: UpdateTransactionService;

	beforeEach(async () => {
		await db.delete(usersTable);

		const childContainer = container.createChildContainer();
		updateTransactionService = childContainer.resolve(UpdateTransactionService);
	});

	test('should update a transaction', async () => {
		const { user, transaction } = await createUserAndTransaction();

		const executeArguments = {
			userId: user?.id ?? '',
			transactionId: transaction?.id ?? '',
			name: 'Updated Transaction',
			date: new Date(),
			amount: 200.0,
			type: 'expense' as (typeof TRANSACTION_TYPES)[number],
		};

		const { transaction: updatedTransaction } =
			await updateTransactionService.execute({ ...executeArguments });

		assert.ok(updatedTransaction);
		assert.strictEqual(updatedTransaction.id, transaction?.id);
		assert.strictEqual(updatedTransaction.userId, transaction?.userId);
		assert.strictEqual(updatedTransaction.name, executeArguments.name);
		assert.strictEqual(
			Number(updatedTransaction.amount),
			executeArguments.amount
		);
		assert.strictEqual(
			updatedTransaction.date.toISOString(),
			executeArguments.date.toISOString()
		);
	});

	test('should throw an error if user is not found', async () => {
		const { transaction } = await createUserAndTransaction();

		const executeArguments = {
			userId: randomUUID(),
			transactionId: transaction?.id ?? '',
			name: 'Updated Transaction',
			date: new Date(),
			amount: 200.0,
			type: 'expense' as (typeof TRANSACTION_TYPES)[number],
		};

		await assert.rejects(
			async () => {
				await updateTransactionService.execute({ ...executeArguments });
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
