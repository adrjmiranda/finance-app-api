import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetUserProfileService } from './GetUserProfileService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('GetUserProfileService', () => {
	let getUserProfileService: GetUserProfileService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		getUserProfileService = childContainer.resolve(GetUserProfileService);
	});

	test('should successfully get the user profile', async (t) => {
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

		const response = await getUserProfileService.execute({ userId: 'uuid-v4' });

		assert.ok(response.user, 'The user should have been returned');
		assert.strictEqual(response.user.email, 'adriano@email.com');
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
				await getUserProfileService.execute({ userId: 'uuid-v4' });
			},
			(error: unknown) => {
				assert.ok(error instanceof AppError);
				assert.strictEqual(error.code, ERROR_CODES.USER_NOT_FOUND);
				assert.strictEqual(error.status, 404);
				return true;
			}
		);
	});
});
