import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DeleteTransactionController } from './DeleteTransactionController.js';
import { DeleteTransactionService } from '#/modules/transactions/services/postgres/DeleteTransactionService/DeleteTransactionService.js';
import { container } from 'tsyringe';
import { randomUUID } from 'node:crypto';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';

describe('DeleteTransactionController', () => {
	let deleteTransactionController: DeleteTransactionController;
	let deleteTransactionService: DeleteTransactionService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		deleteTransactionService = {
			execute: async () => {},
		};

		childContainer.registerInstance(
			DeleteTransactionService,
			deleteTransactionService
		);
		deleteTransactionController = childContainer.resolve(
			DeleteTransactionController
		);
	});

	test('should delete a transaction', async (t) => {
		const transactionPayload = {
			transactionId: randomUUID(),
		};

		const mockRequest = createMockRequest({
			body: transactionPayload,
			user: {
				sub: randomUUID(),
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(
			getTransactionParamsSchema,
			'parse',
			() => transactionPayload
		);
		t.mock.method(deleteTransactionService, 'execute', async () => {});

		await assert.doesNotReject(async () => {
			await deleteTransactionController.handle(mockRequest, mockReply);
		});

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 204);
	});

	test('should throw an error if service fails', async (t) => {
		const transactionPayload = {
			transactionId: randomUUID(),
		};

		const mockRequest = createMockRequest({
			body: transactionPayload,
			user: {
				sub: randomUUID(),
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(
			getTransactionParamsSchema,
			'parse',
			() => transactionPayload
		);
		t.mock.method(deleteTransactionService, 'execute', async () => {
			throw new Error('Service error');
		});

		await assert.rejects(
			async () => {
				await deleteTransactionController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Service error',
			}
		);
	});

	test('should throw an error if body is invalid', async (t) => {
		const transactionPayload = {
			transactionId: randomUUID(),
		};

		const mockRequest = createMockRequest({
			body: transactionPayload,
			user: {
				sub: randomUUID(),
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(getTransactionParamsSchema, 'parse', () => {
			throw new Error('Validation error');
		});

		const mockServiceExecuteFn = t.mock.method(
			deleteTransactionService,
			'execute',
			async () => {}
		);

		await assert.rejects(
			async () => {
				await deleteTransactionController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Validation error',
			}
		);

		assert.strictEqual(mockServiceExecuteFn.mock.callCount(), 0);
	});
});
