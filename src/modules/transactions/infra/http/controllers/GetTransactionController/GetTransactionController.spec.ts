import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionController } from './GetTransactionController.js';
import { GetTransactionService } from '#/modules/transactions/services/postgres/GetTransactionService/GetTransactionService.js';
import { container } from 'tsyringe';
import { randomUUID } from 'node:crypto';
import {
  createMockReply,
  createMockRequest,
} from '#/test/utils/fastify-mock.js';
import type { TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';

describe('GetTransactionController', () => {
  let getTransactionController: GetTransactionController;
  let getTransactionService: GetTransactionService;

  const transactionPayload = {
    transactionId: randomUUID(),
  };

  const userId = randomUUID();

  const transactionData = {
    id: transactionPayload.transactionId,
    userId,
    name: 'Pizza',
    date: new Date(),
    amount: '62.0',
    type: 'expense' as (typeof TRANSACTION_TYPES)[number],
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
    const mockRequest = createMockRequest({
      body: transactionPayload,
      user: {
        sub: userId,
      },
    });
    const mockReply = createMockReply(t);

    t.mock.method(
      getTransactionParamsSchema,
      'parse',
      async () => transactionPayload
    );

    await getTransactionController.handle(mockRequest, mockReply);

    assert.strictEqual(mockReply.status.mock.calls[0]?.arguments[0], 200);
    assert.deepStrictEqual(mockReply.send.mock.calls[0]?.arguments[0], {
      transaction: transactionData,
    });
  });

  test('should throw an error if service fails', async (t) => {
    const mockRequest = createMockRequest({
      body: transactionPayload,
      user: {
        sub: userId,
      },
    });
    const mockReply = createMockReply(t);

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
        await getTransactionController.handle(mockRequest, mockReply);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });

  test('should throw an error if body is invalid', async (t) => {
    const mockRequest = createMockRequest({
      body: transactionPayload,
      user: {
        sub: userId,
      },
    });
    const mockReply = createMockReply(t);

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
        await getTransactionController.handle(mockRequest, mockReply);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );

    assert.strictEqual(mockServiceExecuteFn.mock.callCount(), 0);
  });
});
