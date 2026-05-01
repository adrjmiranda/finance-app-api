import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { container } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { makeUser } from '#/shared/tests/factories/make-user.js';

import { CreateUserService } from './CreateUserService.js';

describe('CreateUserService', () => {
  let createUserService: CreateUserService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();
    createUserService = childContainer.resolve(CreateUserService);
  });

  test('should successfully create a user.', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }));

    const mockCreatedUser = makeUser();

    t.mock.method(db, 'insert', () => ({
      values: () => ({
        returning: () => ({
          execute: () => Promise.resolve([mockCreatedUser]),
        }),
      }),
    }));

    t.mock.method(bcrypt, 'hash', () =>
      Promise.resolve(mockCreatedUser.passwordHash)
    );

    const userData = {
      firstName: mockCreatedUser.firstName,
      lastName: mockCreatedUser.lastName,
      email: mockCreatedUser.email,
      password: faker.internet.password(),
    };

    const response = await createUserService.execute(userData);

    assert.ok(response.user);
    assert.strictEqual(response.user.id, mockCreatedUser.id);
    assert.strictEqual(response.user.email, userData.email);
    assert.strictEqual(response.user.firstName, userData.firstName);
    assert.strictEqual(response.user.lastName, userData.lastName);
  });

  test('should throw an error if the email is already in use', async (t) => {
    const mockUser = makeUser();

    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([mockUser]),
        }),
      }),
    }));

    await assert.rejects(
      async () => {
        await createUserService.execute({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: mockUser.email,
          password: faker.internet.password(),
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.EMAIL_ALREADY_IN_USE);
        assert.strictEqual(error.status, 400);
        return true;
      }
    );
  });

  test('should throw an error if database insertion fails', async (t) => {
    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }));

    t.mock.method(db, 'insert', () => {
      throw new Error('DB Error During Insert');
    });

    await assert.rejects(
      async () => {
        await createUserService.execute({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
        });
      },
      {
        message: 'DB Error During Insert',
      }
    );
  });
});
