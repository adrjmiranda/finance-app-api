import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { eq } from 'drizzle-orm';

describe('DeleteUserProfileController (Integration)', () => {
	beforeEach(async () => {
		await db.delete(usersTable);
	});

	test('should delete the user profile', async () => {
		const { token, authenticatedUser, password } =
			await createAndAuthenticateUser(app);

		const response = await app.inject({
			method: 'DELETE',
			url: '/users/me',
			payload: {
				password,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		assert.strictEqual(response.statusCode, 204);

		const [userInDb] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, authenticatedUser?.id ?? 'not-auth'))
			.limit(1);

		assert.strictEqual(userInDb?.id, undefined);
	});

	test('should throw an error if body is invalid', async () => {
		const { token, password } = await createAndAuthenticateUser(app);

		const response = await app.inject({
			method: 'DELETE',
			url: '/users/me',
			payload: {
				password: 'wrong' + password,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const body = JSON.parse(response.payload);

		assert.strictEqual(response.statusCode, 401);
		assert.deepStrictEqual(body, {
			code: ERROR_CODES.UNAUTHORIZED,
		});
	});
});
