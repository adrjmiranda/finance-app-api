import 'reflect-metadata';

import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import assert from 'assert';
import { container } from 'tsyringe';

import { ListTransactionsService } from '#/modules/transactions/services/postgres/ListTransactionsService/ListTransactionsService.js';
import type { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';

import { ListTransactionsController } from './ListTransactionsController.js';

describe('ListTransactionsController', () => {
  let listTransactionsController: ListTransactionsController;
  let listTransactionsService: ListTransactionsService;

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    listTransactionsService = {
      execute: async () => ({
        transactions: [],
      }),
    };

    childContainer.registerInstance(
      ListTransactionsService,
      listTransactionsService
    );
    listTransactionsController = childContainer.resolve(
      ListTransactionsController
    );
  });

  test('should list transactions', async (t) => {
    const mockUserId = faker.string.uuid();

    const mockHttpRequest = createMockHttpRequest({ userId: mockUserId });

    const mockTransactionsData = [] as Array<
      typeof transactionsTable.$inferSelect
    >;

    t.mock.method(listTransactionsService, 'execute', async () => ({
      transactions: mockTransactionsData,
    }));

    const response = await listTransactionsController.handle(mockHttpRequest);
    const { transactions } = response.body as {
      transactions: Array<typeof transactionsTable.$inferSelect>;
    };

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(transactions, mockTransactionsData);
  });

  test('should throw an error if service fails', async (t) => {
    const mockUserId = faker.string.uuid();

    const mockHttpRequest = createMockHttpRequest({ userId: mockUserId });

    t.mock.method(listTransactionsService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await listTransactionsController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });
});
