import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcrypt';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('CreateUserController (Integration)', () => {
	beforeEach(async () => {
		await db.delete(usersTable);
	});

	test('should create a new user', async () => {
		const userPayload = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john.doe@example.com',
			password: 'password123',
			confirmPassword: 'password123',
		};

		const response = await app.inject({
			method: 'POST',
			url: '/users',
			payload: userPayload,
		});

		assert.strictEqual(response.statusCode, 201);

		const body = JSON.parse(response.payload);

		assert(body.user.id);
		assert.strictEqual(body.user.email, userPayload.email);

		const [userInDb] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, body.user.email))
			.limit(1);

		assert.ok(userInDb);
		assert.strictEqual(userInDb.firstName, userPayload.firstName);
	});

	test('should return 400 when sending invalid data', async () => {
		const invalidPayload = {
			firstName: '123',
			lastName: 15,
			email: 'invalid-email',
			password: 'password',
			confirmPassword: 'pass3453',
		};

		const response = await app.inject({
			method: 'POST',
			url: '/users',
			payload: invalidPayload,
		});

		assert.strictEqual(response.statusCode, 400);
	});

	test('shoud throw an error if email already exists', async () => {
		const firstName = 'Adriano';
		const lastName = 'Miranda';
		const email = 'adriano@email.com';
		const password = 'password123';
		const confirmPassword = 'password123';

		const userPayload = {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
		};

		const passwordHash = await bcrypt.hash(password, 10);

		await db
			.insert(usersTable)
			.values({
				firstName,
				lastName,
				email,
				passwordHash,
			})
			.returning()
			.execute();

		const response = await app.inject({
			method: 'POST',
			url: '/users',
			payload: userPayload,
		});

		assert.strictEqual(response.statusCode, 400);
		assert.strictEqual(
			JSON.parse(response.body).code,
			ERROR_CODES.EMAIL_ALREADY_IN_USE
		);
	});
});
