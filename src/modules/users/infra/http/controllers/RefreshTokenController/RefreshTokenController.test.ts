import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';

describe('RefreshTokenController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should renew access and refresh tokens successfully', async () => {
    const rawPassword = faker.internet.password();
    const userEmail = faker.internet.email();

    const passwordHash = await bcrypt.hash(rawPassword, 10);

    await db
      .insert(usersTable)
      .values({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: userEmail,
        passwordHash,
      })
      .returning()
      .execute();

    const sessionResponse = await app.inject({
      method: 'POST',
      url: '/users/sessions',
      payload: {
        email: userEmail,
        password: rawPassword,
      },
    });

    assert.strictEqual(sessionResponse.statusCode, 200);

    const sessionBody = JSON.parse(sessionResponse.body);
    const currentRefreshToken = sessionBody.refreshToken;

    assert.ok(currentRefreshToken);

    const response = await app.inject({
      method: 'POST',
      url: '/users/refresh',
      payload: {
        refreshToken: currentRefreshToken,
      },
    });

    assert.strictEqual(response.statusCode, 200);

    const responseBody = JSON.parse(response.body);

    assert.ok(responseBody.token);
    assert.ok(responseBody.refreshToken);

    assert.notStrictEqual(responseBody.refreshToken, currentRefreshToken);
  });

  test('should return 401 if refresh token is invalid or expired', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/refresh',
      payload: {
        refreshToken: 'invalid-or-expired-jwt-token',
      },
    });

    assert.strictEqual(response.statusCode, 401);

    const responseBody = JSON.parse(response.body);

    assert.strictEqual(responseBody.code, ERROR_CODES.INVALID_CREDENTIALS);
  });

  test('should return 400 if refreshToken is missing from request body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users/refresh',
      payload: {},
    });

    assert.strictEqual(response.statusCode, 400);

    const responseBody = JSON.parse(response.body);

    assert.strictEqual(responseBody.code, ERROR_CODES.VALIDATION_ERROR);
  });
});
