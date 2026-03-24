import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionsBalanceService } from './GetTransactionsBalanceService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { randomUUID } from 'node:crypto';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';

describe('GetTransactionsBalanceService', () => {
	let getTransactionBalanceService: GetTransactionsBalanceService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		getTransactionBalanceService = childContainer.resolve(
			GetTransactionsBalanceService
		);
	});

	test('should get transactions balance', async (t) => {
		const userId = randomUUID();

		const mockEarnings = 159;
		const mockExpenses = 200;
		const mockInvestments = 525;

		const mockTransactionBalance = {
			earnings: mockEarnings,
			expenses: mockExpenses,
			investments: mockInvestments,
			balance: mockEarnings - mockExpenses - mockInvestments,
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([true]),
					execute: () => Promise.resolve([mockTransactionBalance]),
				}),
			}),
		}));

		const { balance, earnings, expenses, investments } =
			await getTransactionBalanceService.execute({ userId });

		assert.strictEqual(mockTransactionBalance.earnings, earnings);
		assert.strictEqual(mockTransactionBalance.expenses, expenses);
		assert.strictEqual(mockTransactionBalance.investments, investments);
		assert.strictEqual(mockTransactionBalance.balance, balance);
	});

	test('should throw an error if user is not found', async (t) => {
		const userId = randomUUID();

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([]),
					execute: () => Promise.resolve([true]),
				}),
			}),
		}));

		await assert.rejects(
			async () => {
				await getTransactionBalanceService.execute({ userId });
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
