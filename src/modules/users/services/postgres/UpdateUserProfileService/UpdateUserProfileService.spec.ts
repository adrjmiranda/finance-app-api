import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { container } from 'tsyringe';
import { UpdateUserProfileService } from './UpdateUserProfileService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { removeUndefined } from '#/shared/utils/remove-undefined.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';

describe('UpdateUserProfileService', () => {
	let updateUserProfileService: UpdateUserProfileService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		updateUserProfileService = childContainer.resolve(UpdateUserProfileService);
	});

	test('should successfully update the user profile', async (t) => {
		const mockUser = {
			id: 'uuid-v4',
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([mockUser]),
				}),
			}),
		}));

		const userData = removeUndefined({
			firstName: 'Adraino',
			lastName: 'Miranda',
			email: 'adriano@email.com',
		});

		t.mock.method(db, 'update', () => ({
			set: () => ({
				where: () => ({
					returning: () => ({
						execute: () => Promise.resolve([{ ...mockUser, ...userData }]),
					}),
				}),
			}),
		}));

		const response = await updateUserProfileService.execute({
			userId: 'uuid-v4',
			...userData,
		});

		assert.ok(response.user, 'The user should have been returned');
		assert.strictEqual(response.user.firstName, userData.firstName);
	});

	test('should throw an error if the user is not found', async (t) => {
		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([]),
				}),
			}),
		}));

		await assert.rejects(
			async () => {
				await updateUserProfileService.execute({
					userId: 'uuid-v4',
				});
			},
			(error: unknown) => {
				assert.ok(error instanceof AppError);
				assert.strictEqual(error.code, ERROR_CODES.USER_NOT_FOUND);
				assert.strictEqual(error.status, 404);
				return true;
			}
		);
	});

	test('should throw an error if the email is already in use', async (t) => {
		const mockUser = {
			id: 'uuid-v4-user-1',
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([mockUser]),
				}),
			}),
		}));

		const userId = 'uuid-v4-user-2';
		const updatePayload = removeUndefined({
			firstName: 'Adraino',
			lastName: 'Miranda',
			email: 'adriano@email.com',
		});

		await assert.rejects(
			async () => {
				await updateUserProfileService.execute({ userId, ...updatePayload });
			},
			(error: unknown) => {
				assert.ok(error instanceof AppError);
				assert.strictEqual(error.code, ERROR_CODES.EMAIL_ALREADY_IN_USE);
				assert.strictEqual(error.status, 409);
				return true;
			}
		);
	});
});
