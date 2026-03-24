import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import {
	TRANSACTION_TYPES,
	transactionsTable,
} from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { CreateTransactionService } from './CreateTransactionService.js';
import { container } from 'tsyringe';

import { createUser } from '#/shared/utils/user-helper.js';
import { randomUUID } from 'node:crypto';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { and, eq } from 'drizzle-orm';

describe('CreateTransactionService (Integration)', () => {
	let createTransactionService: CreateTransactionService;

	beforeEach(async () => {
		await db.delete(usersTable);

		const childContainer = container.createChildContainer();
		createTransactionService = childContainer.resolve(CreateTransactionService);
	});

	test('should persist a new transaction in the database', async () => {
		const { user } = await createUser();

		const executeArguments = {
			userId: user?.id ?? '',
			name: 'Test Transaction',
			date: new Date(),
			amount: 100.0,
			type: 'earning' as (typeof TRANSACTION_TYPES)[number],
		};

		const { transaction } = await createTransactionService.execute({
			...executeArguments,
		});

		assert.ok(transaction);

		const [transactionInDb] = await db
			.select()
			.from(transactionsTable)
			.where(
				and(
					eq(transactionsTable.id, transaction.id),
					eq(transactionsTable.userId, transaction.userId)
				)
			)
			.limit(1);

		assert.ok(transactionInDb);
		assert.strictEqual(transactionInDb.userId, transaction.userId);
		assert.strictEqual(transactionInDb.name, transaction.name);
		assert.strictEqual(
			transactionInDb.date.toISOString(),
			transaction.date.toISOString()
		);
		assert.strictEqual(transactionInDb.amount, transaction.amount);
		assert.strictEqual(transactionInDb.type, transaction.type);
	});

	test('should throw an error if user is not found', async () => {
		const executeArguments = {
			userId: randomUUID(),
			name: 'Test Transaction',
			date: new Date(),
			amount: 100.0,
			type: 'earning' as (typeof TRANSACTION_TYPES)[number],
		};

		await assert.rejects(
			async () => {
				await createTransactionService.execute({
					...executeArguments,
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
