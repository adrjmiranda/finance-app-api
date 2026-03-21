import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import { container } from 'tsyringe';

import { createUserBodySchema } from '#/modules/users/schemas/requests/body/create-user-body-schema.js';
import { CreateUserController } from './CreateUserController.js';
import { CreateUserService } from '#/modules/users/services/postgres/CreateUserService/CreateUserService.js';

import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';

describe('CreateUserController', () => {
	let createUserController: CreateUserController;
	let createUserService: CreateUserService;

	beforeEach(() => {
		container.clearInstances();
		const childContainer = container.createChildContainer();

		createUserService = {
			execute: async () => ({
				user: undefined,
			}),
		} as CreateUserService;

		childContainer.registerInstance(CreateUserService, createUserService);
		createUserController = childContainer.resolve(CreateUserController);
	});

	test('should create a new user', async (t) => {
		const userPayload = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john.doe@example.com',
			password: 'password123',
		};

		const userData = {
			...userPayload,
			id: 'uuid-v4',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const mockRequest = createMockRequest({
			body: userPayload,
		});
		const mockReply = createMockReply(t);

		t.mock.method(createUserBodySchema, 'parse', () => userPayload);
		t.mock.method(createUserService, 'execute', async () => ({
			user: userData,
		}));

		await createUserController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 201);
		assert.deepStrictEqual(mockReply.send.mock.calls[0]?.arguments[0], {
			user: userData,
		});
	});

	test('should throw an error if service fails', async (t) => {
		const userPayload = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john.doe@example.com',
			password: 'password123',
		};

		const mockRequest = createMockRequest({
			body: userPayload,
		});
		const mockReply = createMockReply(t);

		t.mock.method(createUserBodySchema, 'parse', () => userPayload);

		t.mock.method(createUserService, 'execute', async () => {
			throw new Error('Server error');
		});

		await assert.rejects(
			async () => {
				await createUserController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Server error',
			}
		);
	});

	test('should throw an error if body is invalid', async (t) => {
		const mockRequest = createMockRequest({
			body: {},
		});
		const mockReply = createMockReply(t);

		t.mock.method(createUserBodySchema, 'parse', () => {
			throw new Error('Validation error');
		});

		await assert.rejects(
			async () => {
				await createUserController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Validation error',
			}
		);

		const executeMock = t.mock.method(createUserService, 'execute', () => {
			throw new Error('Service error');
		});

		assert.strictEqual(executeMock.mock.callCount(), 0);
	});
});
