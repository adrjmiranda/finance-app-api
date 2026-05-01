import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { makeUser } from '#/shared/tests/factories/make-user.js';
import { removeUndefined } from '#/shared/utils/remove-undefined.js';

import { UpdateUserProfileService } from './UpdateUserProfileService.js';

describe('UpdateUserProfileService', () => {
  let updateUserProfileService: UpdateUserProfileService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();
    updateUserProfileService = childContainer.resolve(UpdateUserProfileService);
  });

  test('should successfully update the user profile', async (t) => {
    const mockUser = makeUser();

    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([mockUser]),
        }),
      }),
    }));

    const userData = removeUndefined({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    });

    t.mock.method(db, 'update', () => ({
      set: () => ({
        where: () => ({
          returning: () => ({
            execute: () => Promise.resolve([{ ...mockUser, ...userData }]),
          }),
        }),
      }),
    }));

    const response = await updateUserProfileService.execute({
      userId: mockUser.id,
      ...userData,
    });

    assert.ok(response.user);
    assert.strictEqual(response.user.firstName, userData.firstName);
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
        await updateUserProfileService.execute({
          userId: faker.string.uuid(),
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

  test('should throw an error if the email is already in use', async (t) => {
    const mockUser = makeUser();

    t.mock.method(db, 'select', () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([mockUser]),
        }),
      }),
    }));

    const userId = faker.string.uuid();
    const updatePayload = removeUndefined({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    });

    await assert.rejects(
      async () => {
        await updateUserProfileService.execute({ userId, ...updatePayload });
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.EMAIL_ALREADY_IN_USE);
        assert.strictEqual(error.status, 409);
        return true;
      }
    );
  });
});
