import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DeleteUserProfileController } from './DeleteUserProfileController.js';
import { DeleteUserProfileService } from '#/modules/users/services/postgres/DeleteUserProfileService/DeleteUserProfileService.js';
import { container } from 'tsyringe';

import { deleteUserProfileBodySchema } from '#/modules/users/schemas/requests/body/delete-user-profile-body-schema.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';
import { faker } from '@faker-js/faker/locale/uk';

describe('DeleteUserProfileController', () => {
  let deleteUserProfileController: DeleteUserProfileController;
  let deleteUserProfileService: DeleteUserProfileService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    deleteUserProfileService = {
      execute: async () => {},
    } as DeleteUserProfileService;

    childContainer.registerInstance(
      DeleteUserProfileService,
      deleteUserProfileService
    );
    deleteUserProfileController = childContainer.resolve(
      DeleteUserProfileController
    );
  });

  test('should delete the user profile', async (t) => {
    const userPayload = {
      password: faker.internet.password(),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: userPayload,
      userId: faker.string.uuid(),
    });

    t.mock.method(deleteUserProfileBodySchema, 'parse', () => userPayload);

    t.mock.method(deleteUserProfileService, 'execute', async () => {});

    const response = await deleteUserProfileController.handle(mockHttpRequest);

    assert.strictEqual(response.statusCode, 204);
  });

  test('should throw an error if service fails', async (t) => {
    const userPayload = {
      password: faker.internet.password(),
    };

    const mockHttpRequest = createMockHttpRequest();

    t.mock.method(deleteUserProfileBodySchema, 'parse', () => userPayload);
    t.mock.method(deleteUserProfileService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await deleteUserProfileController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('should throw an error if body is invalid', async (t) => {
    const mockHttpRequest = createMockHttpRequest();

    t.mock.method(deleteUserProfileBodySchema, 'parse', () => {
      throw new Error('Validation error');
    });

    await assert.rejects(
      async () => {
        await deleteUserProfileController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );
  });
});
