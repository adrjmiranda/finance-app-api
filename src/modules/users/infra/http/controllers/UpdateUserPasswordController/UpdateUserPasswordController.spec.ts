import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateUserPasswordController } from './UpdateUserPasswordController.js';
import { container } from 'tsyringe';

import { UpdateUserPasswordService } from '#/modules/users/services/postgres/UpdateUserPasswordService/UpdateUserPasswordService.js';
import { updateUserPasswordBodySchema } from '#/modules/users/schemas/requests/body/update-user-password-body-schema.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';
import { faker } from '@faker-js/faker';

describe('UpdateUserPasswordController', () => {
  let updateUserPasswordController: UpdateUserPasswordController;
  let updateUserPasswordService: UpdateUserPasswordService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    updateUserPasswordService = {
      execute: async () => {},
    } as UpdateUserPasswordService;

    childContainer.registerInstance(
      UpdateUserPasswordService,
      updateUserPasswordService
    );
    updateUserPasswordController = childContainer.resolve(
      UpdateUserPasswordController
    );
  });

  test('should update user password', async (t) => {
    const userPayload = {
      oldPassword: faker.internet.password(),
      newPassword: faker.internet.password(),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: userPayload,
      userId: faker.string.uuid(),
    });

    t.mock.method(updateUserPasswordBodySchema, 'parse', () => userPayload);
    t.mock.method(updateUserPasswordService, 'execute', async () => {});

    const response = await updateUserPasswordController.handle(mockHttpRequest);

    assert.strictEqual(response.statusCode, 204);
  });

  test('shold throw an error if service fails', async (t) => {
    const userPayload = {
      oldPassword: faker.internet.password(),
      newPassword: faker.internet.password(),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: userPayload,
      userId: faker.string.uuid(),
    });

    t.mock.method(updateUserPasswordBodySchema, 'parse', () => userPayload);

    t.mock.method(updateUserPasswordService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await updateUserPasswordController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('shold throw an error if body is invalid', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: {},
      userId: faker.string.uuid(),
    });

    t.mock.method(updateUserPasswordBodySchema, 'parse', () => {
      throw new Error('Validation error');
    });

    await assert.rejects(
      async () => {
        await updateUserPasswordController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );

    const executeMock = t.mock.method(
      updateUserPasswordService,
      'execute',
      async () => {
        throw new Error('Service error');
      }
    );

    assert.strictEqual(executeMock.mock.callCount(), 0);
  });
});
