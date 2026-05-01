import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetTransactionsBalanceController } from './GetTransactionsBalanceController.js';
import { GetTransactionsBalanceService } from '#/modules/transactions/services/postgres/GetTransactionsBalanceService/GetTransactionsBalanceService.js';
import { container } from 'tsyringe';
import { faker } from '@faker-js/faker';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';

describe('GetTransactionsBalanceController', () => {
  let getTransactionsBalanceController: GetTransactionsBalanceController;
  let getTransactionsBalanceService: GetTransactionsBalanceService;

  const balanceData = {
    earnings: 0,
    expenses: 0,
    investments: 0,
    balance: 0,
  };

  beforeEach(() => {
    container.clearInstances();
    const childContainer = container.createChildContainer();

    getTransactionsBalanceService = {
      execute: async () => balanceData,
    };

    childContainer.registerInstance(
      GetTransactionsBalanceService,
      getTransactionsBalanceService
    );
    getTransactionsBalanceController = childContainer.resolve(
      GetTransactionsBalanceController
    );
  });

  test('should return the transactions balance', async () => {
    const mockUserId = faker.string.uuid();

    const mockHttpRequest = createMockHttpRequest({ userId: mockUserId });

    const response =
      await getTransactionsBalanceController.handle(mockHttpRequest);

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.body, balanceData);
  });

  test('should throw an error if service fails', async (t) => {
    const mockUserId = faker.string.uuid();

    const mockHttpRequest = createMockHttpRequest({ userId: mockUserId });

    t.mock.method(getTransactionsBalanceService, 'execute', async () => {
      throw new Error('Service error');
    });

    await assert.rejects(
      async () => {
        await getTransactionsBalanceController.handle(mockHttpRequest);
      },
      {
        name: 'Error',
        message: 'Service error',
      }
    );
  });
});
