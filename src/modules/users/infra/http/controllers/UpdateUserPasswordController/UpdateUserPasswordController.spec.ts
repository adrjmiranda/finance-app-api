import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateUserPasswordController } from './UpdateUserPasswordController.js';
import { container } from 'tsyringe';
import {
	createMockReply,
	createMockRequest,
} from '#/test/utils/fastify-mock.js';
import { UpdateUserPasswordService } from '#/modules/users/services/postgres/UpdateUserPasswordService/UpdateUserPasswordService.js';
import { updateUserPasswordBodySchema } from '#/modules/users/schemas/requests/body/update-user-password-body-schema.js';

describe('UpdateUserPasswordController', () => {
	let updateUserPasswordController: UpdateUserPasswordController;
	let updateUserPasswordService: UpdateUserPasswordService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();

		updateUserPasswordService = {
			execute: async () => {},
		} as UpdateUserPasswordService;

		childContainer.registerInstance(
			UpdateUserPasswordService,
			updateUserPasswordService
		);
		updateUserPasswordController = childContainer.resolve(
			UpdateUserPasswordController
		);
	});

	test('should update user password', async (t) => {
		const userPayload = {
			oldPassword: 'oldPassword',
			newPassword: 'newPassword',
		};

		const mockRequest = createMockRequest({
			body: userPayload,
			user: {
				sub: 'uuid-v4',
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(updateUserPasswordBodySchema, 'parse', () => userPayload);
		t.mock.method(updateUserPasswordService, 'execute', async () => {});

		await updateUserPasswordController.handle(mockRequest, mockReply);

		assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 204);
		assert.strictEqual(mockReply.send.mock.calls[0]?.arguments[0], undefined);
	});

	test('shold throw an error if service fails', async (t) => {
		const userPayload = {
			oldPassword: 'oldPassword',
			newPassword: 'newPassword',
		};

		const mockRequest = createMockRequest({
			body: userPayload,
			user: {
				sub: 'uuid-v4',
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(updateUserPasswordBodySchema, 'parse', () => userPayload);

		t.mock.method(updateUserPasswordService, 'execute', async () => {
			throw new Error('Service error');
		});

		await assert.rejects(
			async () => {
				await updateUserPasswordController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Service error',
			}
		);
	});

	test('shold throw an error if body is invalid', async (t) => {
		const mockRequest = createMockRequest({
			body: {},
			user: {
				sub: 'uuid-v4',
			},
		});
		const mockReply = createMockReply(t);

		t.mock.method(updateUserPasswordBodySchema, 'parse', () => {
			throw new Error('Validation error');
		});

		await assert.rejects(
			async () => {
				await updateUserPasswordController.handle(mockRequest, mockReply);
			},
			{
				name: 'Error',
				message: 'Validation error',
			}
		);

		const executeMock = t.mock.method(
			updateUserPasswordService,
			'execute',
			async () => {
				throw new Error('Service error');
			}
		);

		assert.strictEqual(executeMock.mock.callCount(), 0);
	});
});
