import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { container } from 'tsyringe';
import { DeleteUserProfileService } from './DeleteUserProfileService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';

import bcrypt from 'bcrypt';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { makeUser } from '#/shared/tests/factories/make-user.js';
import { faker } from '@faker-js/faker';

describe('DeleteUserProfileService', () => {
  let deleteUserProfileService: DeleteUserProfileService;

  beforeEach(() => {
    const childContainer = container.createChildContainer();
    deleteUserProfileService = childContainer.resolve(DeleteUserProfileService);
  });

  test('should successfully delete the user profile', async (t) => {
    const mockUser = makeUser();

    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([mockUser]),
        }),
      }),
    }));

    t.mock.method(bcrypt, 'compare', () => Promise.resolve(true));

    const deleteMock = t.mock.method(db, 'delete', () => ({
      where: () => ({
        execute: () => Promise.resolve(),
      }),
    }));

    await assert.doesNotReject(async () => {
      await deleteUserProfileService.execute({
        userId: mockUser.id,
        password: faker.internet.password(),
      });
    });

    assert.strictEqual(deleteMock.mock.callCount(), 1);
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
        await deleteUserProfileService.execute({
          userId: faker.string.uuid(),
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

  test('should throw an error if the password is incorrect', async (t) => {
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
        await deleteUserProfileService.execute({
          userId: mockUser.id,
          password: faker.internet.password(),
        });
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.UNAUTHORIZED);
        assert.strictEqual(error.status, 401);
        return true;
      }
    );
  });
});
