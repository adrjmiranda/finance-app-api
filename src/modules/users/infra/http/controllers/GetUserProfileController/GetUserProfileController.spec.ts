import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetUserProfileController } from './GetUserProfileController.js';
import { GetUserProfileService } from '#/modules/users/services/postgres/GetUserProfileService/GetUserProfileService.js';
import { container } from 'tsyringe';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';
import { faker } from '@faker-js/faker';

describe('GetUserProfileController', () => {
  let getUserProfileController: GetUserProfileController;
  let getUserProfileService: GetUserProfileService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    getUserProfileService = {
      execute: async () => ({
        user: {
          id: 'uuid-v4',
          firstName: 'Adriano',
          lastName: 'Miranda',
          email: 'adriano@email.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    } as GetUserProfileService;

    childContainer.registerInstance(
      GetUserProfileService,
      getUserProfileService
    );
    getUserProfileController = childContainer.resolve(GetUserProfileController);
  });

  test('should get the user profile', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      userId: faker.string.uuid(),
    });

    t.mock.method(getUserProfileService, 'execute', async () => ({
      user: {
        id: 'uuid-v4',
      },
    }));

    const response = await getUserProfileController.handle(mockHttpRequest);

    assert.strictEqual(response.statusCode, 200);
  });

  test('should throw an error if service fails', async (t) => {
    const mockHttpRequest = createMockHttpRequest();

    t.mock.method(getUserProfileService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await getUserProfileController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });
});
