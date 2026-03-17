import 'reflect-metadata';
import { container } from 'tsyringe';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import bcrypt from 'bcrypt';

import { AuthenticateUserService } from './AuthenticateUserService.js';

import { db } from '#/shared/infra/database/drizzle/db.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('AuthenticateUserService', () => {
	let authenticateUserService: AuthenticateUserService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		authenticateUserService = childContainer.resolve(AuthenticateUserService);
	});

	test('should successfully authenticate a user', async (t) => {
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

		t.mock.method(bcrypt, 'compare', () => Promise.resolve(true));

		const userData = {
			email: 'adriano@email.com',
			password: 'password123',
		};

		const response = await authenticateUserService.execute(userData);

		assert.ok(response.user, 'The user should have been returned');
		assert.strictEqual(response.user.email, userData.email);
	});

	test('should throw an error if the user is not found', async (t) => {
		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([]),
				}),
			}),
		}));

		const userData = {
			email: 'adriano@email.com',
			password: 'password123',
		};

		await assert.rejects(
			async () => {
				await authenticateUserService.execute(userData);
			},
			(error: unknown) => {
				assert.ok(error instanceof AppError);
				assert.strictEqual(error.code, ERROR_CODES.USER_NOT_FOUND);
				assert.strictEqual(error.status, 404);
				return true;
			}
		);
	});

	test('should throw an error if the password does not match', async (t) => {
		const mockUser = {
			id: 'uuid-v4',
			email: 'adriano@email.com',
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

		const userData = {
			email: 'adriano@email.com',
			password: 'password123',
		};

		await assert.rejects(
			async () => {
				await authenticateUserService.execute(userData);
			},
			(error: unknown) => {
				assert.ok(error instanceof AppError);
				assert.strictEqual(error.code, ERROR_CODES.INVALID_CREDENTIALS);
				assert.strictEqual(error.status, 401);
				return true;
			}
		);
	});
});
