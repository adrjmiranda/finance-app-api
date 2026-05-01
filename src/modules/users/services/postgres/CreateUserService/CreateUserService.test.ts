import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { container } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

import { CreateUserService } from './CreateUserService.js';

describe('CreateUserService (Integration)', () => {
  let createUserService: CreateUserService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    createUserService = childContainer.resolve(CreateUserService);
  });

  test('should persist a new user in the database', async () => {
    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const { user } = await createUserService.execute(userData);

    assert.ok(user?.id);
    assert.strictEqual(user?.email, userData.email);

    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userData.email))
      .limit(1);

    assert.ok(dbUser);
    assert.strictEqual(dbUser.id, user.id);
    assert.ok(dbUser.passwordHash.startsWith('$2b$'));
  });

  test('should not allow creating two users with the same email', async () => {
    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await createUserService.execute(userData);

    await assert.rejects(
      async () => {
        await createUserService.execute(userData);
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.EMAIL_ALREADY_IN_USE);
        assert.strictEqual(error.status, 400);
        return true;
      }
    );
  });
});
