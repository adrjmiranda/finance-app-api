import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionController } from './GetTransactionController.js';
import { GetTransactionService } from '#/modules/transactions/services/postgres/GetTransactionService/GetTransactionService.js';
import { container } from 'tsyringe';

import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';
import { makeTransaction } from '#/shared/tests/factories/make-transaction.js';

describe('GetTransactionController', () => {
  let getTransactionController: GetTransactionController;
  let getTransactionService: GetTransactionService;

  const mockTransactionData = makeTransaction();
  const mockUserId = mockTransactionData.userId;
  const mockTransactionPayload = { transactionId: mockTransactionData.id };

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    getTransactionService = {
      execute: async () => ({
        transaction: mockTransactionData,
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
      body: mockTransactionPayload,
      userId: mockUserId,
    });

    t.mock.method(
      getTransactionParamsSchema,
      'parse',
      async () => mockTransactionPayload
    );

    const response = await getTransactionController.handle(mockHttpRequest);
    const { transaction } = response.body as {
      transaction: typeof mockTransactionData;
    };

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(transaction, mockTransactionData);
  });

  test('should throw an error if service fails', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: mockTransactionPayload,
      userId: mockUserId,
    });

    t.mock.method(
      getTransactionParamsSchema,
      'parse',
      async () => mockTransactionPayload
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
      body: mockTransactionPayload,
      userId: mockUserId,
    });

    t.mock.method(getTransactionParamsSchema, 'parse', () => {
      throw new Error('Validation error');
    });

    const mockServiceExecuteFn = t.mock.method(
      getTransactionService,
      'execute',
      async () => ({
        transaction: mockTransactionData,
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
