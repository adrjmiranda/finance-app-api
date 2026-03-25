import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'assert';
import { ListTransactionsController } from './ListTransactionsController.js';
import { ListTransactionsService } from '#/modules/transactions/services/postgres/ListTransactionsService/ListTransactionsService.js';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';

describe('ListTransactionsController', () => {
	let listTransactionsController: ListTransactionsController;
	let listTransactionsService: ListTransactionsService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		listTransactionsService = {
			execute: async () => ({
				transactions: [],
			}),
		};

		childContainer.registerInstance(
			ListTransactionsService,
			listTransactionsService
		);
		listTransactionsController = childContainer.resolve(
			ListTransactionsController
		);
	});

	test('should list transactions', async (t) => {
		const payload = {
			userId: randomUUID(),
		};

		const mockRequest = createMockRequest({
			user: {
				sub: payload.userId,
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(listTransactionsService, 'execute', async () => ({
			transactions: [],
		}));

		await listTransactionsController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 200);
		assert.deepStrictEqual(mockReply.send.mock.calls[0]?.arguments[0], {
			transactions: [],
		});
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

		t.mock.method(listTransactionsService, 'execute', async () => {
			throw new Error('Service error');
		});

		await assert.rejects(
			async () => {
				await listTransactionsController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Service error',
			}
		);
	});
});
