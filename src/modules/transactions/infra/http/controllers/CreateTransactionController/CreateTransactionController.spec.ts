import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';

import { container } from 'tsyringe';

import { CreateTransactionController } from './CreateTransactionController.js';
import { CreateTransactionService } from '#/modules/transactions/services/postgres/CreateTransactionService/CreateTransactionService.js';

import { createTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/create-transaction-body-schema.js';
import { faker } from '@faker-js/faker';
import { TRANSACTION_TYPES } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';

describe('CreateTransactionController', () => {
  let createTransactionController: CreateTransactionController;
  let createTransactionService: CreateTransactionService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    createTransactionService = {
      execute: async () => ({
        transaction: undefined,
      }),
    };

    childContainer.registerInstance(
      CreateTransactionService,
      createTransactionService
    );
    createTransactionController = childContainer.resolve(
      CreateTransactionController
    );
  });

  test('should create a new transaction', async (t) => {
    const transactionPayload = {
      name: faker.string.alpha(16),
      date: new Date(),
      amount: faker.number.float({ fractionDigits: 2 }),
      type: faker.helpers.arrayElement(TRANSACTION_TYPES),
    };

    const transactionData = {
      ...transactionPayload,
      amount: transactionPayload.amount.toString(),
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: transactionPayload,
      userId: transactionData.userId,
    });

    t.mock.method(
      createTransactionBodySchema,
      'parse',
      () => transactionPayload
    );
    t.mock.method(createTransactionService, 'execute', async () => ({
      transaction: transactionData,
    }));

    const response = await createTransactionController.handle(mockHttpRequest);
    const { transaction } = response.body as {
      transaction: typeof transactionData;
    };

    assert.strictEqual(response.statusCode, 201);
    assert.deepStrictEqual(transaction, transactionData);
  });

  test('should throw an error if service fails', async (t) => {
    const transactionPayload = {
      name: faker.string.alpha(16),
      date: new Date(),
      amount: faker.number.float({ fractionDigits: 2 }),
      type: faker.helpers.arrayElement(TRANSACTION_TYPES),
    };

    const mockHttpRequest = createMockHttpRequest({
      body: transactionPayload,
      userId: faker.string.uuid(),
    });

    t.mock.method(
      createTransactionBodySchema,
      'parse',
      () => transactionPayload
    );
    t.mock.method(createTransactionService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await createTransactionController.handle(mockHttpRequest);
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

    t.mock.method(createTransactionBodySchema, 'parse', () => {
      throw new Error('Validation error');
    });

    await assert.rejects(
      async () => {
        await createTransactionController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Validation error',
      }
    );
  });
});
