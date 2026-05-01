import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionController } from './GetTransactionController.js';
import { GetTransactionService } from '#/modules/transactions/services/postgres/GetTransactionService/GetTransactionService.js';
import { container } from 'tsyringe';

import { TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { faker } from '@faker-js/faker';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';

describe('GetTransactionController', () => {
  let getTransactionController: GetTransactionController;
  let getTransactionService: GetTransactionService;

  const transactionPayload = {
    transactionId: faker.string.uuid(),
  };

  const userId = faker.string.uuid();

  const transactionData = {
    id: transactionPayload.transactionId,
    userId,
    name: faker.string.alphanumeric(16),
    date: new Date(),
    amount: String(faker.number.float({ fractionDigits: 2 })),
    type: faker.helpers.arrayElement(TRANSACTION_TYPES),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    getTransactionService = {
      execute: async () => ({
        transaction: transactionData,
      }),
    };

    childContainer.registerInstance(
      GetTransactionService,
      getTransactionService
    );
    getTransactionController = childContainer.resolve(GetTransactionController);
  });

  test('should get a transaction', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: transactionPayload,
      userId,
    });

    t.mock.method(
      getTransactionParamsSchema,
      'parse',
      async () => transactionPayload
    );

    const response = await getTransactionController.handle(mockHttpRequest);
    const { transaction } = response.body as {
      transaction: typeof transactionData;
    };

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(transaction, transactionData);
  });

  test('should throw an error if service fails', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: transactionPayload,
      userId,
    });

    t.mock.method(
      getTransactionParamsSchema,
      'parse',
      async () => transactionPayload
    );
    t.mock.method(getTransactionService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await getTransactionController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('should throw an error if body is invalid', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: transactionPayload,
      userId,
    });

    t.mock.method(getTransactionParamsSchema, 'parse', () => {
      throw new Error('Validation error');
    });

    const mockServiceExecuteFn = t.mock.method(
      getTransactionService,
      'execute',
      async () => ({
        transaction: transactionData,
      })
    );

    await assert.rejects(
      async () => {
        await getTransactionController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );

    assert.strictEqual(mockServiceExecuteFn.mock.callCount(), 0);
  });
});
