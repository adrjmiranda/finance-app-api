import 'reflect-metadata';

import { container } from 'tsyringe';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AuthenticateUserService } from './AuthenticateUserService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

import bcrypt from 'bcrypt';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { faker } from '@faker-js/faker';

describe('AuthenticateUserService (Integration)', () => {
  let authenticateUserService: AuthenticateUserService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    authenticateUserService = childContainer.resolve(AuthenticateUserService);
  });

  test('should authenticate a user', async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const passwordHash = bcrypt.hashSync(password, 10);

    await db.insert(usersTable).values({
      firstName,
      lastName,
      email,
      passwordHash,
    });

    const { user } = await authenticateUserService.execute({ email, password });

    assert.ok(user?.id);
    assert.strictEqual(user?.email, email);
  });

  test('should throw an error if password does not match', async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const passwordHash = bcrypt.hashSync(password, 10);

    await db.insert(usersTable).values({
      firstName,
      lastName,
      email,
      passwordHash,
    });

    await assert.rejects(
      async () => {
        await authenticateUserService.execute({
          email,
          password: faker.internet.password(),
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.INVALID_CREDENTIALS);
        assert.strictEqual(error.status, 401);
        return true;
      }
    );
  });
});
