import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { app } from '#/shared/infra/http/app.js';

describe('CreateUserController (Integration)', () => {
  beforeEach(async () => {
    await db.delete(usersTable);
  });

  test('should create a new user', async () => {
    const passwordPayload = faker.internet.password();

    const userPayload = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: passwordPayload,
      confirmPassword: passwordPayload,
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
      firstName: faker.number.int(),
      lastName: faker.internet.emoji(),
      email: faker.animal.fish(),
      password: faker.internet.password(),
      confirmPassword: faker.internet.password(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: invalidPayload,
    });

    assert.strictEqual(response.statusCode, 400);
  });

  test('shoud throw an error if email already exists', async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const confirmPassword = password;

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

    const body = response.json();

    assert.strictEqual(body.code, ERROR_CODES.EMAIL_ALREADY_IN_USE);
  });
});
