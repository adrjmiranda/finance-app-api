import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { container } from 'tsyringe';
import { DeleteUserProfileService } from './DeleteUserProfileService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';

import bcrypt from 'bcrypt';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('DeleteUserProfileService', () => {
	let deleteUserProfileService: DeleteUserProfileService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		deleteUserProfileService = childContainer.resolve(DeleteUserProfileService);
	});

	test('should successfully delete the user profile', async (t) => {
		const mockUser = {
			id: 'uuid-v4',
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			createdAt: new Date(),
			updatedAt: new Date(),
			passwordHash: 'hashed_on_db',
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([mockUser]),
				}),
			}),
		}));

		t.mock.method(bcrypt, 'compare', () => Promise.resolve(true));

		const deleteMock = t.mock.method(db, 'delete', () => ({
			where: () => ({
				execute: () => Promise.resolve(),
			}),
		}));

		await assert.doesNotReject(async () => {
			await deleteUserProfileService.execute({
				userId: 'uuid-v4',
				password: 'password123',
			});
		});

		assert.strictEqual(deleteMock.mock.callCount(), 1);
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
				await deleteUserProfileService.execute({
					userId: 'uuid-v4',
					password: 'password123',
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

	test('should throw an error if the password is incorrect', async (t) => {
		const mockUser = {
			id: 'uuid-v4',
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			createdAt: new Date(),
			updatedAt: new Date(),
			passwordHash: 'hashed_on_db',
		};

		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([mockUser]),
				}),
			}),
		}));

		t.mock.method(bcrypt, 'compare', () => Promise.resolve(false));

		await assert.rejects(
			async () => {
				await deleteUserProfileService.execute({
					userId: 'uuid-v4',
					password: 'password123',
				});
			},
			(error: unknown) => {
				assert.ok(error instanceof AppError);
				assert.strictEqual(error.code, ERROR_CODES.UNAUTHORIZED);
				assert.strictEqual(error.status, 401);
				return true;
			}
		);
	});
});
