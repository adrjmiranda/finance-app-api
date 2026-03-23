import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('UpdateUserPasswordController (Integration)', () => {
	beforeEach(async () => {
		await db.delete(usersTable);
	});

	test('should update user password', async () => {
		const { token, password } = await createAndAuthenticateUser(app);

		const response = await app.inject({
			method: 'PATCH',
			url: '/users/me/password',
			payload: {
				oldPassword: password,
				newPassword: 'newPassword123',
				confirmNewPassword: 'newPassword123',
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		assert.strictEqual(response.statusCode, 204);
	});

	test('should throw an error if body is invalid', async () => {
		const { token, password } = await createAndAuthenticateUser(app);

		const response = await app.inject({
			method: 'PATCH',
			url: '/users/me/password',
			payload: {
				oldPassword: 'wrong' + password,
				newPassword: 'newPassword123',
				confirmNewPassword: 'newPassword123',
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const body = JSON.parse(response.payload);

		assert.strictEqual(response.statusCode, 401);
		assert.deepStrictEqual(body, {
			code: ERROR_CODES.INVALID_CREDENTIALS,
		});
	});
});
