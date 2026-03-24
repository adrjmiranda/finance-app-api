import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ListTransactionsService } from './ListTransactionsService.js';
import { container } from 'tsyringe';
import { randomUUID } from 'node:crypto';
import { db } from '#/shared/infra/database/drizzle/db.js';
import type { TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('ListTransactionsService', () => {
	let listTransactionService: ListTransactionsService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		listTransactionService = childContainer.resolve(ListTransactionsService);
	});

	test('should list all transactions', async (t) => {
		const data = {
			userId: randomUUID(),
		};

		const mockTransactions = Array.from({ length: 5 }, (_, i) => i).map(
			(n) => ({
				id: randomUUID(),
				userId: data.userId,
				name: `Test Transaction ${n}`,
				date: new Date(),
				amount: 100.0,
				type: 'earning' as (typeof TRANSACTION_TYPES)[number],
				createdAt: new Date(),
				updatedAt: new Date(),
			})
		);

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => {
					const chain = {
						limit: () => Promise.resolve([true]),
						then: (
							onSuccess: (value: typeof mockTransactions | boolean[]) => unknown
						) => Promise.resolve(mockTransactions).then(onSuccess),
					};

					return chain;
				},
			}),
		}));

		const { transactions } = await listTransactionService.execute(data);

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
		const data = {
			userId: randomUUID(),
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => {
					const chain = {
						limit: () => Promise.resolve([]),
						then: (onSuccess: (value: boolean[]) => unknown) =>
							Promise.resolve([]).then(onSuccess),
					};

					return chain;
				},
			}),
		}));

		await assert.rejects(
			async () => {
				await listTransactionService.execute(data);
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
