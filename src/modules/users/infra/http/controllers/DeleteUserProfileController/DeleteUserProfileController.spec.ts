import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DeleteUserProfileController } from './DeleteUserProfileController.js';
import { DeleteUserProfileService } from '#/modules/users/services/postgres/DeleteUserProfileService/DeleteUserProfileService.js';
import { container } from 'tsyringe';
import {
  createMockReply,
  createMockRequest,
} from '#/test/utils/fastify-mock.js';
import { deleteUserProfileBodySchema } from '#/modules/users/schemas/requests/body/delete-user-profile-body-schema.js';

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
      password: 'password123',
    };

    const mockRequest = createMockRequest({
      body: userPayload,
      user: {
        sub: 'uuid-v4',
      },
    });
    const mockReply = createMockReply(t);

    t.mock.method(deleteUserProfileBodySchema, 'parse', () => userPayload);

    t.mock.method(deleteUserProfileService, 'execute', async () => {});

    await deleteUserProfileController.handle(mockRequest, mockReply);

    assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 204);
  });

  test('should throw an error if service fails', async (t) => {
    const userPayload = {
      password: 'password123',
    };

    const mockRequest = createMockRequest({
      body: userPayload,
      user: {
        sub: 'uuid-v4',
      },
    });
    const mockReply = createMockReply(t);

    t.mock.method(deleteUserProfileBodySchema, 'parse', () => userPayload);
    t.mock.method(deleteUserProfileService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await deleteUserProfileController.handle(mockRequest, mockReply);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('should throw an error if body is invalid', async (t) => {
    const mockRequest = createMockRequest({
      body: {},
      user: {
        sub: 'uuid-v4',
      },
    });
    const mockReply = createMockReply(t);

    t.mock.method(deleteUserProfileBodySchema, 'parse', () => {
      throw new Error('Validation error');
    });

    await assert.rejects(
      async () => {
        await deleteUserProfileController.handle(mockRequest, mockReply);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );
  });
});
