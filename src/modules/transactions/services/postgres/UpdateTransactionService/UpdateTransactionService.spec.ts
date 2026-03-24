import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateTransactionService } from './UpdateTransactionService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { randomUUID } from 'node:crypto';
import { TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('UpdateTransactionService', () => {
	let updateTransactionService: UpdateTransactionService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		updateTransactionService = childContainer.resolve(UpdateTransactionService);
	});

	test('should update a transaction', async (t) => {
		const transactionData = {
			transactionId: randomUUID(),
			userId: randomUUID(),
			name: 'Test Transaction',
			date: new Date(),
			amount: 100.0,
			type: 'earning' as (typeof TRANSACTION_TYPES)[number],
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([true]),
				}),
			}),
		}));

		const mockUpdatedTransaction = {
			id: transactionData.transactionId,
			userId: transactionData.userId,
			name: 'Updated Transaction',
			date: new Date(),
			amount: 150.0,
			type: 'expense' as (typeof TRANSACTION_TYPES)[number],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

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
			...transactionData,
		});

		assert.strictEqual(
			transactionData.transactionId,
			mockUpdatedTransaction.id
		);
		assert.strictEqual(transaction?.userId, mockUpdatedTransaction.userId);
		assert.strictEqual(transaction?.name, mockUpdatedTransaction.name);
		assert.strictEqual(transaction?.date, mockUpdatedTransaction.date);
		assert.strictEqual(transaction?.amount, mockUpdatedTransaction.amount);
		assert.strictEqual(transaction?.type, mockUpdatedTransaction.type);
	});

	test('should throw an error if user is not found', async (t) => {
		const transactionData = {
			transactionId: randomUUID(),
			userId: randomUUID(),
			name: 'Test Transaction',
			date: new Date(),
			amount: 100.0,
			type: 'earning' as (typeof TRANSACTION_TYPES)[number],
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([]),
				}),
			}),
		}));

		const updateMock = t.mock.method(db, 'update', () => ({
			set: () => ({
				where: () => ({
					returning: () => ({
						execute: () => Promise.resolve([]),
					}),
				}),
			}),
		}));

		await assert.rejects(
			async () => {
				await updateTransactionService.execute({
					...transactionData,
				});
			},
			(error: unknown) => {
				assert.ok(error instanceof AppError);
				assert.strictEqual(error.code, ERROR_CODES.USER_NOT_FOUND);
				assert.strictEqual(error.status, 404);
				return true;
			}
		);

		assert.strictEqual(updateMock.mock.callCount(), 0);
	});
});
