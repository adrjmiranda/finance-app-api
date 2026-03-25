import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import { container } from 'tsyringe';

import { CreateTransactionController } from './CreateTransactionController.js';
import { CreateTransactionService } from '#/modules/transactions/services/postgres/CreateTransactionService/CreateTransactionService.js';
import { randomUUID } from 'node:crypto';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';
import { createTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/create-transaction-body-schema.js';

describe('CreateTransactionController', () => {
	let createTransactionController: CreateTransactionController;
	let createTransactionService: CreateTransactionService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		createTransactionService = {
			execute: async () => ({
				transaction: undefined,
			}),
		};

		childContainer.registerInstance(
			CreateTransactionService,
			createTransactionService
		);
		createTransactionController = childContainer.resolve(
			CreateTransactionController
		);
	});

	test('should create a new transaction', async (t) => {
		const transactionPayload = {
			name: 'Pizza',
			date: new Date(),
			amount: 62.0,
			type: 'expense',
		};

		const transactionData = {
			...transactionPayload,
			amount: transactionPayload.amount.toString(),
			id: randomUUID(),
			userId: randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const mockRequest = createMockRequest({
			body: transactionPayload,
			user: {
				sub: randomUUID(),
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(
			createTransactionBodySchema,
			'parse',
			() => transactionPayload
		);
		t.mock.method(createTransactionService, 'execute', async () => ({
			transaction: transactionData,
		}));

		await createTransactionController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 201);
		assert.deepStrictEqual(mockReply.send.mock.calls[0]?.arguments[0], {
			transaction: transactionData,
		});
	});

	test('should throw an error if service fails', async (t) => {
		const transactionPayload = {
			name: 'Pizza',
			date: new Date(),
			amount: 62.0,
			type: 'expense',
		};

		const mockRequest = createMockRequest({
			body: transactionPayload,
			user: {
				sub: randomUUID(),
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(
			createTransactionBodySchema,
			'parse',
			() => transactionPayload
		);
		t.mock.method(createTransactionService, 'execute', async () => {
			throw new Error('Service error');
		});

		await assert.rejects(
			async () => {
				await createTransactionController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Service error',
			}
		);
	});

	test('should throw an error if body is invalid', async (t) => {
		const transactionPayload = {
			name: 'Pizza',
			date: new Date(),
			amount: 62.0,
			type: 'expense',
		};

		const transactionData = {
			...transactionPayload,
			amount: transactionPayload.amount.toString(),
			id: randomUUID(),
			userId: randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const mockRequest = createMockRequest({
			body: transactionPayload,
			user: {
				sub: randomUUID(),
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(createTransactionBodySchema, 'parse', () => {
			throw new Error('Validation error');
		});

		const mockServiceExecuteFn = t.mock.method(
			createTransactionService,
			'execute',
			async () => ({
				transaction: transactionData,
			})
		);

		await assert.rejects(
			async () => {
				await createTransactionController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Validation error',
			}
		);

		assert.strictEqual(mockServiceExecuteFn.mock.callCount(), 0);
	});
});
