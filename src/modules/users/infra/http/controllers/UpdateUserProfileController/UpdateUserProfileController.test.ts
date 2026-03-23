import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

import bcrypt from 'bcrypt';
import { app } from '#/shared/infra/http/app.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('UpdateUserProfileController (Integration)', () => {
	beforeEach(async () => {
		await db.delete(usersTable);
	});

	test('should update user profile', async () => {
		const userPayload = {
			firstName: 'Adriano',
			lastName: 'Miranda Update',
			email: 'adrianoupdate@email.com',
		};

		const password = 'password123';
		const passwordHash = await bcrypt.hash(password, 10);

		const [createdUser] = await db
			.insert(usersTable)
			.values({
				firstName: 'Adriano',
				lastName: 'Miranda',
				email: 'adriano@email.com',
				passwordHash,
			})
			.returning()
			.execute();

		const authenticationResponse = await app.inject({
			method: 'POST',
			url: '/users/sessions',
			payload: {
				email: createdUser?.email,
				password,
			},
		});

		const autenticationBody = JSON.parse(authenticationResponse.payload);
		const token = autenticationBody.token;

		const response = await app.inject({
			method: 'PATCH',
			url: '/users/me',
			payload: userPayload,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const body = JSON.parse(response.payload);

		assert.strictEqual(response.statusCode, 200);
		assert.strictEqual(body.user.id, createdUser?.id);
		assert.strictEqual(body.user.firstName, userPayload.firstName);
		assert.strictEqual(body.user.lastName, userPayload.lastName);
		assert.strictEqual(body.user.email, userPayload.email);
		assert.strictEqual(
			body.user.createdAt,
			createdUser?.createdAt.toISOString()
		);
	});

	test('should throw an error if body is invalid', async () => {
		const userPayload = {
			firstName: 'Adriano Update',
			lastName: 'Miranda Update',
			email: 'adrianoupdate@email.com',
		};

		const password = 'password123';
		const passwordHash = await bcrypt.hash(password, 10);

		const [createdUser] = await db
			.insert(usersTable)
			.values({
				firstName: 'Adriano',
				lastName: 'Miranda',
				email: 'adriano@email.com',
				passwordHash,
			})
			.returning()
			.execute();

		const authenticationResponse = await app.inject({
			method: 'POST',
			url: '/users/sessions',
			payload: {
				email: createdUser?.email,
				password,
			},
		});

		const autenticationBody = JSON.parse(authenticationResponse.payload);
		const token = autenticationBody.token;

		const response = await app.inject({
			method: 'PATCH',
			url: '/users/me',
			payload: userPayload,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const body = JSON.parse(response.payload);

		assert.strictEqual(response.statusCode, 400);
		assert.deepStrictEqual(body, {
			code: 'VALIDATION_ERROR',
			errors: {
				firstName: ERROR_CODES.INVALID_NAME,
			},
		});
	});

	test('should throw an error if token is invalid', async () => {
		const userPayload = {
			firstName: 'Adriano Update',
			lastName: 'Miranda Update',
			email: 'adrianoupdate@email.com',
		};

		const password = 'password123';
		const passwordHash = await bcrypt.hash(password, 10);

		const [createdUser] = await db
			.insert(usersTable)
			.values({
				firstName: 'Adriano',
				lastName: 'Miranda',
				email: 'adriano@email.com',
				passwordHash,
			})
			.returning()
			.execute();

		const authenticationResponse = await app.inject({
			method: 'POST',
			url: '/users/sessions',
			payload: {
				email: createdUser?.email,
				password,
			},
		});

		const autenticationBody = JSON.parse(authenticationResponse.payload);
		const token = autenticationBody.token;

		const response = await app.inject({
			method: 'PATCH',
			url: '/users/me',
			payload: userPayload,
			headers: {
				Authorization: `Bearer INVALID-TOKEN-${token}`,
			},
		});

		const body = JSON.parse(response.payload);

		assert.strictEqual(response.statusCode, 401);
		assert.deepStrictEqual(body, {
			code: ERROR_CODES.UNAUTHORIZED,
		});
	});
});
