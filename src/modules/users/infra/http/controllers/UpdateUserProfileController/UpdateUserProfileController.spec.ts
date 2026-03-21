import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateUserProfileController } from './UpdateUserProfileController.js';
import { container } from 'tsyringe';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';
import { updateUserProfileBodySchema } from '#/modules/users/schemas/requests/body/update-user-profile-body-schema.js';
import { UpdateUserProfileService } from '#/modules/users/services/postgres/UpdateUserProfileService/UpdateUserProfileService.js';

describe('UpdateUserProfileController', () => {
	let updateUserProfileController: UpdateUserProfileController;
	let updateUserProfileService: UpdateUserProfileService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		updateUserProfileService = {
			execute: async () => ({
				user: undefined,
			}),
		} as UpdateUserProfileService;

		childContainer.registerInstance(
			UpdateUserProfileService,
			updateUserProfileService
		);
		updateUserProfileController = childContainer.resolve(
			UpdateUserProfileController
		);
	});

	test('should update user profile', async (t) => {
		const userPayload = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john.doe@example.com',
		};

		const userData = {
			...userPayload,
			id: 'uuid-v4',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const mockRequest = createMockRequest({
			body: { ...userPayload },
			user: {
				sub: 'uuid-v4',
			},
		});

		const mockReply = createMockReply(t);

		t.mock.method(updateUserProfileBodySchema, 'parse', () => userPayload);
		t.mock.method(updateUserProfileService, 'execute', async () => ({
			user: userData,
		}));

		await updateUserProfileController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 200);
		assert.deepStrictEqual(mockReply.send.mock.calls[0]?.arguments[0], {
			user: userData,
		});
	});

	test('should throw an error if service fails', async (t) => {
		const userPayload = {
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
		};

		const mockRequest = createMockRequest({
			body: userPayload,
			user: {
				sub: 'uuid-v4',
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(updateUserProfileBodySchema, 'parse', () => userPayload);

		t.mock.method(updateUserProfileService, 'execute', async () => {
			throw new Error('Server error');
		});

		await assert.rejects(
			async () => {
				await updateUserProfileController.handle(mockRequest, mockReply);
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
			user: {
				sub: 'uuid-v4',
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(updateUserProfileBodySchema, 'parse', () => {
			throw new Error('Validation error');
		});

		await assert.rejects(
			async () => {
				await updateUserProfileController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Validation error',
			}
		);

		const executeMock = t.mock.method(
			updateUserProfileService,
			'execute',
			async () => {
				throw new Error('Service error');
			}
		);

		assert.strictEqual(executeMock.mock.callCount(), 0);
	});
});
