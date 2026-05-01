import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateTransactionController } from './UpdateTransactionController.js';
import { UpdateTransactionService } from '#/modules/transactions/services/postgres/UpdateTransactionService/UpdateTransactionService.js';
import { container } from 'tsyringe';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { updateTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/update-transaction-body-schema.js';
import { makeTransaction } from '#/shared/tests/factories/make-transaction.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';

describe('UpdateTransactionController', () => {
  let updateTransactionController: UpdateTransactionController;
  let updateTransactionService: UpdateTransactionService;

  const mockTransactionDataToUpdate = makeTransaction();

  const mockUserId = mockTransactionDataToUpdate.userId;
  const mockTransactionId = mockTransactionDataToUpdate.id;

  const payload = {
    name: mockTransactionDataToUpdate.name,
    date: mockTransactionDataToUpdate.date,
    amount: Number(mockTransactionDataToUpdate.amount),
    type: mockTransactionDataToUpdate.type,
  };

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    updateTransactionService = {
      execute: async () => ({
        transaction: mockTransactionDataToUpdate,
      }),
    };

    childContainer.registerInstance(
      UpdateTransactionService,
      updateTransactionService
    );
    updateTransactionController = childContainer.resolve(
      UpdateTransactionController
    );
  });

  test('should update transaction', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: payload,
      userId: mockUserId,
    });

    t.mock.method(getTransactionParamsSchema, 'parse', () => ({
      transactinoId: mockTransactionId,
    }));
    t.mock.method(updateTransactionBodySchema, 'parse', () => payload);

    const response = await updateTransactionController.handle(mockHttpRequest);
    const { transaction } = response.body as {
      transaction: typeof mockTransactionDataToUpdate;
    };

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(transaction, mockTransactionDataToUpdate);
  });

  test('should throw an error if service fails', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: payload,
      userId: mockUserId,
    });

    t.mock.method(getTransactionParamsSchema, 'parse', () => ({
      transactionId: mockTransactionId,
    }));
    t.mock.method(updateTransactionBodySchema, 'parse', () => payload);

    t.mock.method(updateTransactionService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await updateTransactionController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('should throw an error if transaction id params are invalid', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: payload,
      userId: mockUserId,
    });

    t.mock.method(getTransactionParamsSchema, 'parse', () => {
      throw new Error('Transaction id params error');
    });
    const mockUpdateTransactionBodySchemaParseFn = t.mock.method(
      updateTransactionBodySchema,
      'parse',
      () => payload
    );

    const mockServiceExecuteFn = t.mock.method(
      updateTransactionService,
      'execute',
      async () => ({
        transaction: undefined,
      })
    );

    await assert.rejects(
      async () => {
        await updateTransactionController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Transaction id params error',
      }
    );

    assert.strictEqual(mockServiceExecuteFn.mock.callCount(), 0);
    assert.strictEqual(
      mockUpdateTransactionBodySchemaParseFn.mock.callCount(),
      0
    );
  });

  test('should throw an error if payload body is invalid', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: payload,
      userId: mockUserId,
    });

    t.mock.method(getTransactionParamsSchema, 'parse', () => ({
      transactionId: mockTransactionId,
    }));
    t.mock.method(updateTransactionBodySchema, 'parse', () => {
      throw new Error('Transaction payload body error');
    });

    const mockServiceExecuteFn = t.mock.method(
      updateTransactionService,
      'execute',
      async () => ({
        transaction: undefined,
      })
    );

    await assert.rejects(
      async () => {
        await updateTransactionController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Transaction payload body error',
      }
    );

    assert.strictEqual(mockServiceExecuteFn.mock.callCount(), 0);
  });
});
