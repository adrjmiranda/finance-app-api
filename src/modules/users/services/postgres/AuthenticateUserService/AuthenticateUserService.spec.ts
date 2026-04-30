import 'reflect-metadata';
import { container } from 'tsyringe';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import bcrypt from 'bcrypt';

import { AuthenticateUserService } from './AuthenticateUserService.js';

import { db } from '#/shared/infra/database/drizzle/db.js';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { makeUser } from '#/shared/tests/factories/make-user.js';
import { faker } from '@faker-js/faker';

describe('AuthenticateUserService', () => {
  let authenticateUserService: AuthenticateUserService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();
    authenticateUserService = childContainer.resolve(AuthenticateUserService);
  });

  test('should successfully authenticate a user', async (t) => {
    const mockUser = makeUser();

    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([mockUser]),
        }),
      }),
    }));

    t.mock.method(bcrypt, 'compare', () => Promise.resolve(true));

    const response = await authenticateUserService.execute({
      email: mockUser.email,
      password: faker.internet.password(),
    });

    assert.ok(response.user);
    assert.strictEqual(response.user.email, mockUser.email);
  });

  test('should throw an error if the user is not found', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }));

    await assert.rejects(
      async () => {
        await authenticateUserService.execute({
          email: faker.internet.email(),
          password: faker.internet.password(),
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.USER_NOT_FOUND);
        assert.strictEqual(error.status, 404);
        return true;
      }
    );
  });

  test('should throw an error if the password does not match', async (t) => {
    const mockUser = makeUser();

    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([mockUser]),
        }),
      }),
    }));

    t.mock.method(bcrypt, 'compare', () => Promise.resolve(false));

    await assert.rejects(
      async () => {
        await authenticateUserService.execute({
          email: mockUser.email,
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
