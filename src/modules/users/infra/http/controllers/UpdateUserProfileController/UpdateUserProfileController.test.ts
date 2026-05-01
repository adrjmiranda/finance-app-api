import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

import { app } from '#/shared/infra/http/app.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';
import { faker } from '@faker-js/faker';

describe('UpdateUserProfileController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should update user profile', async () => {
    const userPayload = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    };

    const { token, authenticatedUser } = await createAndAuthenticateUser(app);

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
    assert.strictEqual(body.user.id, authenticatedUser?.id);
    assert.strictEqual(body.user.firstName, userPayload.firstName);
    assert.strictEqual(body.user.lastName, userPayload.lastName);
    assert.strictEqual(body.user.email, userPayload.email);
    assert.strictEqual(
      body.user.createdAt,
      authenticatedUser?.createdAt.toISOString()
    );
  });

  test('should throw an error if body is invalid', async () => {
    const userPayload = {
      firstName: faker.color.lch(),
      lastName: faker.number.float({ fractionDigits: 2 }),
      email: faker.string.alphanumeric(16),
    };

    const { token } = await createAndAuthenticateUser(app);

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
        email: ERROR_CODES.INVALID_EMAIL,
        firstName: ERROR_CODES.INVALID_NAME,
        lastName: ERROR_CODES.INVALID_NAME,
      },
    });
  });

  test('should throw an error if token is invalid', async () => {
    const userPayload = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    };

    const { token } = await createAndAuthenticateUser(app);

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
