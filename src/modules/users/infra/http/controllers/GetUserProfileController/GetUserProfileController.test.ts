import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';
import { app } from '#/shared/infra/http/app.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { faker } from '@faker-js/faker';

describe('GetUserProfileController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should get the user profile', async () => {
    const { token, authenticatedUser } = await createAndAuthenticateUser(app);

    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = JSON.parse(response.payload);

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(body.user.id, authenticatedUser?.id);
    assert.strictEqual(body.user.firstName, authenticatedUser?.firstName);
    assert.strictEqual(body.user.lastName, authenticatedUser?.lastName);
    assert.strictEqual(body.user.email, authenticatedUser?.email);
  });

  test('should throw an error if user is not authenticated', async () => {
    const { token } = await createAndAuthenticateUser(app);

    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: {
        Authorization: `Bearer INVALID-TOKEN-${token}`,
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });

  test('should throw an error if user not found', async () => {
    const token = app.jwt.sign({
      sub: faker.string.uuid(),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = JSON.parse(response.payload);

    assert.strictEqual(response.statusCode, 404);
    assert.deepStrictEqual(body, {
      code: ERROR_CODES.USER_NOT_FOUND,
    });
  });
});
