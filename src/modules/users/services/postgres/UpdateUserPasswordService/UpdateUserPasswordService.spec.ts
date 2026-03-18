import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateUserPasswordService } from './UpdateUserPasswordService.js';
import { container } from 'tsyringe';
import { db } from '#/shared/infra/database/drizzle/db.js';
import bcrypt from 'bcrypt';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('UpdateUserPasswordService', () => {
	let updateUserPasswordService: UpdateUserPasswordService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		updateUserPasswordService = childContainer.resolve(
			UpdateUserPasswordService
		);
	});

	test('should successfully update the user password', async (t) => {
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

		const updateMock = t.mock.method(db, 'update', () => ({
			set: () => ({
				where: () => ({
					execute: () => Promise.resolve(),
				}),
			}),
		}));

		t.mock.method(bcrypt, 'compare', () => Promise.resolve(true));
		t.mock.method(bcrypt, 'hash', () => Promise.resolve('hashed_password'));

		await assert.doesNotReject(async () => {
			await updateUserPasswordService.execute({
				userId: 'uuid-v4  ',
				oldPassword: 'old_password',
				newPassword: 'new_password',
			});
		});

		assert.strictEqual(updateMock.mock.callCount(), 1);
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
				await updateUserPasswordService.execute({
					userId: 'uuid-v4',
					oldPassword: 'old_password',
					newPassword: 'new_password',
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

	test('should throw an error if the old password is incorrect', async (t) => {
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
				await updateUserPasswordService.execute({
					userId: 'uuid-v4  ',
					oldPassword: 'old_password',
					newPassword: 'new_password',
				});
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
