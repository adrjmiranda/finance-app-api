import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AuthenticateUserController } from './AuthenticateUserController.js';
import { AuthenticateUserService } from '#/modules/users/services/postgres/AuthenticateUserService/AuthenticateUserService.js';
import { container } from 'tsyringe';
import { authenticateBodySchema } from '#/modules/users/schemas/requests/body/authenticate-body-schema.js';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';

describe('AuthenticateUserController', () => {
	let authenticateUserController: AuthenticateUserController;
	let authenticateUserService: AuthenticateUserService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		authenticateUserService = {
			execute: async () => ({
				user: {
					id: 'uuid-v4',
					firstName: 'Adriano',
					lastName: 'Miranda',
					email: 'adriano@email.com',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			}),
		} as AuthenticateUserService;

		childContainer.registerInstance(
			AuthenticateUserService,
			authenticateUserService
		);
		authenticateUserController = childContainer.resolve(
			AuthenticateUserController
		);
	});

	test('should authenticate a user', async (t) => {
		const userPayload = {
			email: 'adriano@email.com',
			password: 'password123',
		};

		const mockRequest = createMockRequest({
			body: userPayload,
		});
		const mockReply = createMockReply(t);

		const mockToken = 'mocked-jwt-token';
		mockReply.jwtSign = t.mock.fn(async () => mockToken);

		const userData = {
			id: 'uuid-v4',
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		t.mock.method(authenticateBodySchema, 'parse', () => userPayload);
		t.mock.method(authenticateUserService, 'execute', async () => ({
			user: userData,
		}));

		await authenticateUserController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 200);
		assert.deepStrictEqual(mockReply.send.mock.calls[0]?.arguments[0], {
			user: userData,
			token: mockToken,
		});
	});

	test('should throw an error if service fails', async (t) => {
		const userPayload = {
			email: 'adriano@email.com',
			password: 'password123',
		};

		const mockRequest = createMockRequest({
			body: userPayload,
		});
		const mockReply = createMockReply(t);

		t.mock.method(authenticateBodySchema, 'parse', () => userPayload);

		t.mock.method(authenticateUserService, 'execute', async () => {
			throw new Error('Service error');
		});

		await assert.rejects(
			async () => {
				await authenticateUserController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Service error',
			}
		);
	});

	test('should throw an error if body is invalid', async (t) => {
		const mockRequest = createMockRequest({
			body: {},
		});
		const mockReply = createMockReply(t);

		t.mock.method(authenticateBodySchema, 'parse', () => {
			throw new Error('Validation error');
		});

		await assert.rejects(
			async () => {
				await authenticateUserController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Validation error',
			}
		);
	});
});
