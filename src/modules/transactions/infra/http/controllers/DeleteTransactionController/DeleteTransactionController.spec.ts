import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DeleteTransactionController } from './DeleteTransactionController.js';
import { DeleteTransactionService } from '#/modules/transactions/services/postgres/DeleteTransactionService/DeleteTransactionService.js';
import { container } from 'tsyringe';

import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { faker } from '@faker-js/faker';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';

describe('DeleteTransactionController', () => {
  let deleteTransactionController: DeleteTransactionController;
  let deleteTransactionService: DeleteTransactionService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    deleteTransactionService = {
      execute: async () => {},
    };

    childContainer.registerInstance(
      DeleteTransactionService,
      deleteTransactionService
    );
    deleteTransactionController = childContainer.resolve(
      DeleteTransactionController
    );
  });

  test('should delete a transaction', async (t) => {
    const transactionPayload = {
      transactionId: faker.string.uuid(),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: transactionPayload,
      userId: faker.string.uuid(),
    });

    t.mock.method(
      getTransactionParamsSchema,
      'parse',
      () => transactionPayload
    );
    t.mock.method(deleteTransactionService, 'execute', async () => {});

    const response = await deleteTransactionController.handle(mockHttpRequest);

    assert.strictEqual(response.statusCode, 204);
  });

  test('should throw an error if service fails', async (t) => {
    const transactionPayload = {
      transactionId: faker.string.uuid(),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: transactionPayload,
      userId: faker.string.uuid(),
    });

    t.mock.method(
      getTransactionParamsSchema,
      'parse',
      () => transactionPayload
    );
    t.mock.method(deleteTransactionService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await deleteTransactionController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('should throw an error if body is invalid', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: {},
      userId: faker.string.uuid(),
    });

    t.mock.method(getTransactionParamsSchema, 'parse', () => {
      throw new Error('Validation error');
    });

    await assert.rejects(
      async () => {
        await deleteTransactionController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );
  });
});
