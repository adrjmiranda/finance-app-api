import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

import bcrypt from 'bcrypt';
import { app } from '#/shared/infra/http/app.js';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { faker } from '@faker-js/faker';

describe('AuthenticateUserController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should authenticate a user', async () => {
    const userPayload = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const passwordHash = await bcrypt.hash(userPayload.password, 10);

    const [createdUser] = await db
      .insert(usersTable)
      .values({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: userPayload.email,
        passwordHash,
      })
      .returning()
      .execute();

    const response = await app.inject({
      method: 'POST',
      url: '/users/sessions',
      payload: userPayload,
    });

    assert.strictEqual(response.statusCode, 200);

    const body = JSON.parse(response.payload);

    assert.strictEqual(body.user.id, createdUser?.id);
    assert.strictEqual(body.user.firstName, createdUser?.firstName);
    assert.strictEqual(body.user.lastName, createdUser?.lastName);
    assert.strictEqual(body.user.email, createdUser?.email);
    assert.ok(body.token);
  });

  test('should throw an error if user does not exist', async () => {
    const userPayload = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/users/sessions',
      payload: userPayload,
    });

    assert.strictEqual(response.statusCode, 404);

    const body = JSON.parse(response.payload);

    assert.strictEqual(body.code, ERROR_CODES.USER_NOT_FOUND);
  });

  test('should throw an error if password is incorrect', async () => {
    const userPayload = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const passwordHash = await bcrypt.hash(faker.internet.password(), 10);

    await db
      .insert(usersTable)
      .values({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: userPayload.email,
        passwordHash,
      })
      .returning()
      .execute();

    const response = await app.inject({
      method: 'POST',
      url: '/users/sessions',
      payload: userPayload,
    });

    assert.strictEqual(response.statusCode, 401);

    const body = JSON.parse(response.payload);

    assert.strictEqual(body.code, ERROR_CODES.INVALID_CREDENTIALS);
  });
});
