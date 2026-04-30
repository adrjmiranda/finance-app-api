import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateUserProfileController } from './UpdateUserProfileController.js';
import { container } from 'tsyringe';

import { updateUserProfileBodySchema } from '#/modules/users/schemas/requests/body/update-user-profile-body-schema.js';
import { UpdateUserProfileService } from '#/modules/users/services/postgres/UpdateUserProfileService/UpdateUserProfileService.js';
import { faker } from '@faker-js/faker';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';

describe('UpdateUserProfileController', () => {
  let updateUserProfileController: UpdateUserProfileController;
  let updateUserProfileService: UpdateUserProfileService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    updateUserProfileService = {
      execute: async () => ({
        user: undefined,
      }),
    } as UpdateUserProfileService;

    childContainer.registerInstance(
      UpdateUserProfileService,
      updateUserProfileService
    );
    updateUserProfileController = childContainer.resolve(
      UpdateUserProfileController
    );
  });

  test('should update user profile', async (t) => {
    const userPayload = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    };

    const userData = {
      id: faker.string.uuid(),
      ...userPayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: userPayload,
      userId: faker.string.uuid(),
    });

    t.mock.method(updateUserProfileBodySchema, 'parse', () => userPayload);
    t.mock.method(updateUserProfileService, 'execute', async () => ({
      user: userData,
    }));

    const response = await updateUserProfileController.handle(mockHttpRequest);

    const { user } = response.body as { user: typeof userData };

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(user, userData);
  });

  test('should throw an error if service fails', async (t) => {
    const userPayload = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: userPayload,
      userId: faker.string.uuid(),
    });

    t.mock.method(updateUserProfileBodySchema, 'parse', () => userPayload);

    t.mock.method(updateUserProfileService, 'execute', async () => {
      throw new Error('Server error');
    });

    await assert.rejects(
      async () => {
        await updateUserProfileController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Server error',
      }
    );
  });

  test('should throw an error if body is invalid', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: {},
      userId: faker.string.uuid(),
    });

    t.mock.method(updateUserProfileBodySchema, 'parse', () => {
      throw new Error('Validation error');
    });

    await assert.rejects(
      async () => {
        await updateUserProfileController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );

    const executeMock = t.mock.method(
      updateUserProfileService,
      'execute',
      async () => {
        throw new Error('Service error');
      }
    );

    assert.strictEqual(executeMock.mock.callCount(), 0);
  });
});
