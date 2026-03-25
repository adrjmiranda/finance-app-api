import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateTransactionController } from './UpdateTransactionController.js';
import { UpdateTransactionService } from '#/modules/transactions/services/postgres/UpdateTransactionService/UpdateTransactionService.js';
import { container } from 'tsyringe';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { updateTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/update-transaction-body-schema.js';
import { randomUUID } from 'node:crypto';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';

describe('UpdateTransactionController', () => {
	let updateTransactionController: UpdateTransactionController;
	let updateTransactionService: UpdateTransactionService;

	const userId = randomUUID();
	const transactionId = randomUUID();

	const payload = {
		name: 'Pizza',
		date: new Date(),
		amount: 62.5,
		type: 'expense',
	};

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		updateTransactionService = {
			execute: async () => ({
				transaction: undefined,
			}),
		};

		childContainer.registerInstance(
			UpdateTransactionService,
			updateTransactionService
		);
		updateTransactionController = childContainer.resolve(
			UpdateTransactionController
		);
	});

	test('should update transaction', async (t) => {
		const mockRequest = createMockRequest({
			body: payload,
			user: {
				sub: userId,
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(getTransactionParamsSchema, 'parse', () => ({
			transactionId,
		}));
		t.mock.method(updateTransactionBodySchema, 'parse', () => payload);

		const transactionData = {
			...payload,
			id: transactionId,
			userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		t.mock.method(updateTransactionService, 'execute', async () => ({
			transaction: transactionData,
		}));

		await updateTransactionController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 200);
		assert.deepStrictEqual(mockReply.send.mock.calls[0]?.arguments[0], {
			transaction: transactionData,
		});
	});

	test('should throw an error if service fails', async (t) => {
		const mockRequest = createMockRequest({
			body: payload,
			user: {
				sub: userId,
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(getTransactionParamsSchema, 'parse', () => ({
			transactionId,
		}));
		t.mock.method(updateTransactionBodySchema, 'parse', () => payload);

		t.mock.method(updateTransactionService, 'execute', async () => {
			throw new Error('Service error');
		});

		await assert.rejects(
			async () => {
				await updateTransactionController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Service error',
			}
		);
	});

	test('should throw an error if transaction id params are invalid', async (t) => {
		const mockRequest = createMockRequest({
			body: payload,
			user: {
				sub: userId,
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(getTransactionParamsSchema, 'parse', () => {
			throw new Error('Transaction id params error');
		});
		const mockUpdateTransactionBodySchemaParseFn = t.mock.method(
			updateTransactionBodySchema,
			'parse',
			() => payload
		);

		const mockServiceExecuteFn = t.mock.method(
			updateTransactionService,
			'execute',
			async () => ({
				transaction: undefined,
			})
		);

		await assert.rejects(
			async () => {
				await updateTransactionController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Transaction id params error',
			}
		);

		assert.strictEqual(mockServiceExecuteFn.mock.callCount(), 0);
		assert.strictEqual(
			mockUpdateTransactionBodySchemaParseFn.mock.callCount(),
			0
		);
	});

	test('should throw an error if payload body is invalid', async (t) => {
		const mockRequest = createMockRequest({
			body: payload,
			user: {
				sub: userId,
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(getTransactionParamsSchema, 'parse', () => ({
			transactionId,
		}));
		t.mock.method(updateTransactionBodySchema, 'parse', () => {
			throw new Error('Transaction payload body error');
		});

		const mockServiceExecuteFn = t.mock.method(
			updateTransactionService,
			'execute',
			async () => ({
				transaction: undefined,
			})
		);

		await assert.rejects(
			async () => {
				await updateTransactionController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Transaction payload body error',
			}
		);

		assert.strictEqual(mockServiceExecuteFn.mock.callCount(), 0);
	});
});
