import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionService } from './GetTransactionService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { randomUUID } from 'node:crypto';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('GetTransactionService', () => {
	let getTransactionService: GetTransactionService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		getTransactionService = childContainer.resolve(GetTransactionService);
	});

	test('should get a transaction', async (t) => {
		const mockTransaction = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'Test Transaction',
			date: new Date(),
			amount: 100.0,
			type: 'earning',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const selectMock = t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => {
						if (selectMock.mock.callCount() === 1) {
							return Promise.resolve([{ id: mockTransaction.userId }]);
						}

						return Promise.resolve([mockTransaction]);
					},
				}),
			}),
		}));

		const { transaction } = await getTransactionService.execute({
			userId: mockTransaction.userId,
			transactionId: mockTransaction.id,
		});

		assert.strictEqual(selectMock.mock.callCount(), 2);
		assert.strictEqual(transaction?.id, mockTransaction.id);
		assert.strictEqual(transaction?.userId, mockTransaction.userId);
	});

	test('should throw an error if user is not found', async (t) => {
		const selectMock = t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => {
						if (selectMock.mock.callCount() === 1) {
							return Promise.resolve([]);
						}

						return Promise.resolve([true]);
					},
				}),
			}),
		}));

		await assert.rejects(
			async () => {
				await getTransactionService.execute({
					userId: randomUUID(),
					transactionId: randomUUID(),
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
		const executeArguments = {
			transactionId: randomUUID(),
			userId: randomUUID(),
		};

		const selectMock = t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => {
						if (selectMock.mock.callCount() === 1) {
							return Promise.resolve([true]);
						}

						return Promise.resolve([]);
					},
				}),
			}),
		}));

		await assert.rejects(
			async () => {
				await getTransactionService.execute({ ...executeArguments });
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
