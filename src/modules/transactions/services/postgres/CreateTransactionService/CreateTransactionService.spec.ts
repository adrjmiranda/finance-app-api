import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CreateTransactionService } from './CreateTransactionService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { randomUUID } from 'node:crypto';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('CreateTransactionService', () => {
	let createTransactionService: CreateTransactionService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		createTransactionService = childContainer.resolve(CreateTransactionService);
	});

	test('should create a new transaction', async (t) => {
		const transactionData = {
			userId: randomUUID(),
			name: 'Test Transaction',
			date: new Date(),
			amount: 100.0,
			type: TRANSACTION_TYPES[0],
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([true]),
				}),
			}),
		}));

		const mockCreatedTransaction = {
			...transactionData,
			id: randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		t.mock.method(db, 'insert', () => ({
			values: () => ({
				returning: () => ({
					execute: () => Promise.resolve([mockCreatedTransaction]),
				}),
			}),
		}));

		const { transaction } = await createTransactionService.execute({
			...transactionData,
		});

		assert.strictEqual(transaction?.id, mockCreatedTransaction.id);
		assert.strictEqual(transaction?.userId, mockCreatedTransaction.userId);
		assert.strictEqual(transaction?.name, mockCreatedTransaction.name);
		assert.strictEqual(transaction?.date, mockCreatedTransaction.date);
		assert.strictEqual(transaction?.amount, mockCreatedTransaction.amount);
		assert.strictEqual(transaction?.type, mockCreatedTransaction.type);
	});

	test('should throw an error if user is not found', async (t) => {
		const transactionData = {
			userId: randomUUID(),
			name: 'Test Transaction',
			date: new Date(),
			amount: 100.0,
			type: TRANSACTION_TYPES[0],
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([]),
				}),
			}),
		}));

		await assert.rejects(
			async () => {
				await createTransactionService.execute({
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
	});
});
