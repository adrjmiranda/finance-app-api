import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionsBalanceController } from './GetTransactionsBalanceController.js';
import { GetTransactionsBalanceService } from '#/modules/transactions/services/postgres/GetTransactionsBalanceService/GetTransactionsBalanceService.js';
import { container } from 'tsyringe';
import { randomUUID } from 'node:crypto';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';

describe('GetTransactionsBalanceController', () => {
	let getTransactionsBalanceController: GetTransactionsBalanceController;
	let getTransactionsBalanceService: GetTransactionsBalanceService;

	const balanceData = {
		earnings: 0,
		expenses: 0,
		investments: 0,
		balance: 0,
	};

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		getTransactionsBalanceService = {
			execute: async () => balanceData,
		};

		childContainer.registerInstance(
			GetTransactionsBalanceService,
			getTransactionsBalanceService
		);
		getTransactionsBalanceController = childContainer.resolve(
			GetTransactionsBalanceController
		);
	});

	test('should return the transactions balance', async (t) => {
		const payload = {
			userId: randomUUID(),
		};

		const mockRequest = createMockRequest({
			user: {
				sub: payload.userId,
			},
		});
		const mockReply = createMockReply(t);

		await getTransactionsBalanceController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 200);
		assert.deepStrictEqual(
			mockReply.send.mock.calls[0]?.arguments[0],
			balanceData
		);
	});

	test('should throw an error if service fails', async (t) => {
		const payload = {
			userId: randomUUID(),
		};

		const mockRequest = createMockRequest({
			user: {
				sub: payload.userId,
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(getTransactionsBalanceService, 'execute', async () => {
			throw new Error('Service error');
		});

		await assert.rejects(
			async () => {
				await getTransactionsBalanceController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Service error',
			}
		);
	});
});
