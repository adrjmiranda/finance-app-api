import 'reflect-metadata';
import { describe, test, beforeEach, type Mock } from 'node:test';
import assert from 'node:assert';
import { container } from 'tsyringe';

import { CreateUserController } from './CreateUserController.js';
import { createUserBodySchema } from '#/modules/users/schemas/requests/body/create-user-body-schema.js';
import { CreateUserService } from '#/modules/users/services/postgres/CreateUserService/CreateUserService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

// Tipos utilitários para reduzir o ruído nos testes
type MockReply = FastifyReply & {
	status: Mock<(code: number) => FastifyReply>;
	send: Mock<(payload?: unknown) => FastifyReply>;
};

describe('CreateUserController', () => {
	let createUserController: CreateUserController;
	let createUserService: CreateUserService;

	beforeEach(() => {
		container.clearInstances();
		const childContainer = container.createChildContainer();

		// Criamos o service como um objeto de mocks
		createUserService = {
			execute: async () => ({
				user: undefined,
			}),
		} as CreateUserService;

		childContainer.registerInstance(CreateUserService, createUserService);
		createUserController = childContainer.resolve(CreateUserController);
	});

	test('should create a new user', async (t) => {
		// 1. Setup de dados (DADO/GIVEN)
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

		// 2. Setup de Mocks (QUANDO/WHEN)
		const mockRequest = { body: userPayload } as FastifyRequest;

		const mockReply = {
			status: t.mock.fn(() => mockReply),
			send: t.mock.fn(() => mockReply),
		} as unknown as MockReply;

		// Mock do Schema e do Service
		t.mock.method(createUserBodySchema, 'parse', () => userPayload);
		t.mock.method(createUserService, 'execute', async () => ({
			user: userData,
		}));

		// 3. Execução (AÇÃO/ACT)
		await createUserController.handle(mockRequest, mockReply);

		// 4. Verificações (ENTÃO/THEN)
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

		const mockRequest = { body: userPayload } as FastifyRequest;

		const mockReply = {
			status: t.mock.fn(() => mockReply),
			send: t.mock.fn(() => mockReply),
		} as unknown as MockReply;

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
		const mockRequest = { body: {} } as FastifyRequest;

		const mockReply = {
			status: t.mock.fn(() => mockReply),
			send: t.mock.fn(() => mockReply),
		} as unknown as MockReply;

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

		const serviceExecuteFnMock = createUserService.execute as unknown as Mock<
			typeof createUserService.execute
		>;
		const serviceCallCount = serviceExecuteFnMock.mock?.calls.length ?? 0;

		assert.strictEqual(serviceCallCount, 0);
	});
});
