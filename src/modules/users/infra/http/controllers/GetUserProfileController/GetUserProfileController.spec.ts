import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetUserProfileController } from './GetUserProfileController.js';
import { GetUserProfileService } from '#/modules/users/services/postgres/GetUserProfileService/GetUserProfileService.js';
import { container } from 'tsyringe';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';

describe('GetUserProfileController', () => {
	let getUserProfileController: GetUserProfileController;
	let getUserProfileService: GetUserProfileService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		getUserProfileService = {
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
		} as GetUserProfileService;

		childContainer.registerInstance(
			GetUserProfileService,
			getUserProfileService
		);
		getUserProfileController = childContainer.resolve(GetUserProfileController);
	});

	test('should get the user profile', async (t) => {
		const mockRequest = createMockRequest({
			user: {
				sub: 'uuid-v4',
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(getUserProfileService, 'execute', async () => ({
			user: {
				id: 'uuid-v4',
			},
		}));

		await getUserProfileController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 200);
	});

	test('should throw an error if service fails', async (t) => {
		const mockRequest = createMockRequest({
			user: {
				sub: 'uuid-v4',
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(getUserProfileService, 'execute', async () => {
			throw new Error('Service error');
		});

		await assert.rejects(
			async () => {
				await getUserProfileController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Service error',
			}
		);
	});
});
