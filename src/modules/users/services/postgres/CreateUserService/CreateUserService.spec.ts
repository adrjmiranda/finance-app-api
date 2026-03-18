import 'reflect-metadata';
import { container } from 'tsyringe';

import bcrypt from 'bcrypt';

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

import { CreateUserService } from './CreateUserService.js';

import { db } from '#/shared/infra/database/drizzle/db.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('CreateUserService', () => {
	let createUserService: CreateUserService;

	beforeEach(() => {
		const childContainer = container.createChildContainer();
		createUserService = childContainer.resolve(CreateUserService);
	});

	test('should successfully create a user.', async (t) => {
		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([]),
				}),
			}),
		}));

		const mockCreatedUser = {
			id: 'uuid-v4',
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		t.mock.method(db, 'insert', () => ({
			values: () => ({
				returning: () => ({
					execute: () => Promise.resolve([mockCreatedUser]),
				}),
			}),
		}));

		t.mock.method(bcrypt, 'hash', () => Promise.resolve('hashed_password'));

		const userData = {
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			password: 'strongpassword123',
		};

		const response = await createUserService.execute(userData);

		assert.ok(response.user, 'The user should have been returned');
		assert.strictEqual(response.user.email, userData.email);
		assert.strictEqual(response.user.firstName, userData.firstName);
		assert.strictEqual(response.user.lastName, userData.lastName);
		assert.strictEqual(response.user.id, mockCreatedUser.id);
	});

	test('should throw an error if the email is already in use', async (t) => {
		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([{ id: 'existing-id' }]),
				}),
			}),
		}));

		const userData = {
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			password: 'password123',
		};

		await assert.rejects(
			async () => {
				await createUserService.execute(userData);
			},
			(error: unknown) => {
				assert.ok(
					error instanceof AppError,
					'Error should be an instance of AppError'
				);
				assert.strictEqual(error.code, ERROR_CODES.EMAIL_ALREADY_IN_USE);
				assert.strictEqual(error.status, 400);

				return true;
			}
		);
	});

	test('should throw an error if database insertion fails', async (t) => {
		t.mock.method(db, 'select', () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([]),
				}),
			}),
		}));

		t.mock.method(db, 'insert', () => {
			throw new Error('Database connection lost');
		});

		const userData = {
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'adriano@email.com',
			password: 'password123',
		};

		await assert.rejects(
			async () => {
				await createUserService.execute(userData);
			},
			{
				message: 'Database connection lost',
			}
		);
	});
});
