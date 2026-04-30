import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AuthenticateUserController } from './AuthenticateUserController.js';
import { AuthenticateUserService } from '#/modules/users/services/postgres/AuthenticateUserService/AuthenticateUserService.js';
import { container } from 'tsyringe';
import { authenticateBodySchema } from '#/modules/users/schemas/requests/body/authenticate-body-schema.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';
import type { ITokenProvider } from '#/shared/containers/providers/TokenProvider/models/ITokenProvider.js';
import { faker } from '@faker-js/faker';

describe('AuthenticateUserController', () => {
  let authenticateUserController: AuthenticateUserController;
  let authenticateUserService: AuthenticateUserService;

  let tokenProvider: ITokenProvider;

  const userData = {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    const childContainer = container.createChildContainer();

    authenticateUserService = {
      execute: async () => ({ user: userData }),
    } as AuthenticateUserService;

    childContainer.registerInstance('TokenProvider', {
      generate: () => {},
      verify: () => {},
    });

    childContainer.registerInstance(
      AuthenticateUserService,
      authenticateUserService
    );

    tokenProvider = childContainer.resolve<ITokenProvider>('TokenProvider');

    authenticateUserController = childContainer.resolve(
      AuthenticateUserController
    );
  });

  test('should authenticate a user', async (t) => {
    const userPayload = {
      email: userData.email,
      password: faker.internet.password(),
    };

    const mockHttpRequest = createMockHttpRequest();

    const mockToken = faker.string.alphanumeric(32);
    t.mock.method(tokenProvider, 'generate', () => mockToken);

    t.mock.method(authenticateBodySchema, 'parse', () => userPayload);

    const response = await authenticateUserController.handle(mockHttpRequest);

    const { user, token } = response.body as {
      user: typeof userData;
      token: string;
    };

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(user, userData);
    assert.strictEqual(token, mockToken);
  });

  test('should throw an error if service fails', async (t) => {
    const userPayload = {
      email: userData.email,
      password: faker.internet.password(),
    };

    const mockHttpRequest = createMockHttpRequest();

    t.mock.method(authenticateBodySchema, 'parse', () => userPayload);

    t.mock.method(authenticateUserService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await authenticateUserController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('should throw an error if body is invalid', async (t) => {
    const mockHttpRequest = createMockHttpRequest();

    t.mock.method(authenticateBodySchema, 'parse', () => {
      throw new Error('Validation error');
    });

    await assert.rejects(
      async () => {
        await authenticateUserController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );
  });
});
