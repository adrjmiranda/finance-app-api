import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import { container } from 'tsyringe';

import { createUserBodySchema } from '#/modules/users/schemas/requests/body/create-user-body-schema.js';
import { CreateUserController } from './CreateUserController.js';
import { CreateUserService } from '#/modules/users/services/postgres/CreateUserService/CreateUserService.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';
import { makeUser } from '#/shared/tests/factories/make-user.js';
import { faker } from '@faker-js/faker';

describe('CreateUserController', () => {
  let createUserController: CreateUserController;
  let createUserService: CreateUserService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    createUserService = {
      execute: async () => ({
        user: undefined,
      }),
    } as CreateUserService;

    childContainer.registerInstance(CreateUserService, createUserService);
    createUserController = childContainer.resolve(CreateUserController);
  });

  test('should create a new user', async (t) => {
    const userData = makeUser();

    const mockHttoRequest = createMockHttpRequest();

    t.mock.method(createUserBodySchema, 'parse', () => ({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: faker.internet.password(),
    }));
    t.mock.method(createUserService, 'execute', async () => ({
      user: userData,
    }));

    const response = await createUserController.handle(mockHttoRequest);
    const { user } = response.body as {
      user: Omit<typeof userData, 'passwordHash'>;
    };

    assert.strictEqual(response.statusCode, 201);
    assert.deepEqual(user, userData as Omit<typeof userData, 'passwordHash'>);
  });

  test('should throw an error if service fails', async (t) => {
    const userData = makeUser();

    const mockHttoRequest = createMockHttpRequest();

    t.mock.method(createUserBodySchema, 'parse', () => ({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: faker.internet.password(),
    }));

    t.mock.method(createUserService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await createUserController.handle(mockHttoRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('should throw an error if body is invalid', async (t) => {
    const mockHttoRequest = createMockHttpRequest();

    t.mock.method(createUserBodySchema, 'parse', () => {
      throw new Error('Validation error');
    });

    await assert.rejects(
      async () => {
        await createUserController.handle(mockHttoRequest);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );

    const executeMock = t.mock.method(
      createUserService,
      'execute',
      async () => {
        throw new Error('Service error');
      }
    );

    assert.strictEqual(executeMock.mock.callCount(), 0);
  });
});
