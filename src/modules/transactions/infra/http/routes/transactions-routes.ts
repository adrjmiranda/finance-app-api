import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { container } from 'tsyringe';
import * as z from 'zod';

import { CreateTransactionController } from '#/modules/transactions/infra/http/controllers/CreateTransactionController/CreateTransactionController.js';
import { DeleteTransactionController } from '#/modules/transactions/infra/http/controllers/DeleteTransactionController/DeleteTransactionController.js';
import { GetTransactionController } from '#/modules/transactions/infra/http/controllers/GetTransactionController/GetTransactionController.js';
import { GetTransactionsBalanceController } from '#/modules/transactions/infra/http/controllers/GetTransactionsBalanceController/GetTransactionsBalanceController.js';
import { ListTransactionsController } from '#/modules/transactions/infra/http/controllers/ListTransactionsController/ListTransactionsController.js';
import { UpdateTransactionController } from '#/modules/transactions/infra/http/controllers/UpdateTransactionController/UpdateTransactionController.js';
import { createTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/create-transaction-body-schema.js';
import { updateTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/update-transaction-body-schema.js';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { createTransactionResponseSchema } from '#/modules/transactions/schemas/responses/create-transaction-response-schema.js';
import { getTransactionResponseSchema } from '#/modules/transactions/schemas/responses/get-transaction-response-schema.js';
import { getTransactionsBalanceResponseSchema } from '#/modules/transactions/schemas/responses/get-transactions-balance-response-schema.js';
import { listTransactionsResponseSchema } from '#/modules/transactions/schemas/responses/list-transactions-response-schema.js';
import { updateTransactionResponseSchema } from '#/modules/transactions/schemas/responses/update-transaction-response-schema.js';
import { httpRouteAdapter } from '#/shared/adapters/HttpRouteAdapter.js';
import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', VerifyJWT.handle);

  const createTransactionController = container.resolve(
    CreateTransactionController
  );
  const getTransactionController = container.resolve(GetTransactionController);
  const listTransactionsController = container.resolve(
    ListTransactionsController
  );
  const updateTransactionController = container.resolve(
    UpdateTransactionController
  );
  const deleteTransactionController = container.resolve(
    DeleteTransactionController
  );
  const getTransactionsBalanceController = container.resolve(
    GetTransactionsBalanceController
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'Create a transaction',
        body: createTransactionBodySchema,
        security: [{ bearerAuth: [] }],
        response: {
          201: createTransactionResponseSchema,
        },
      },
    },
    httpRouteAdapter(createTransactionController)
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:transactionId',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get a transaction',
        params: getTransactionParamsSchema,
        security: [{ bearerAuth: [] }],
        response: {
          200: getTransactionResponseSchema,
        },
      },
    },
    httpRouteAdapter(getTransactionController)
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'List transactions',
        security: [{ bearerAuth: [] }],
        response: {
          200: listTransactionsResponseSchema,
        },
      },
    },
    httpRouteAdapter(listTransactionsController)
  );
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/:transactionId',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update a transaction',
        body: updateTransactionBodySchema,
        params: getTransactionParamsSchema,
        security: [{ bearerAuth: [] }],
        response: {
          200: updateTransactionResponseSchema,
        },
      },
    },
    httpRouteAdapter(updateTransactionController)
  );
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:transactionId',
    {
      schema: {
        tags: ['Users'],
        summary: 'Delete a transaction',
        params: getTransactionParamsSchema,
        security: [{ bearerAuth: [] }],
        response: {
          204: z.never(),
        },
      },
    },
    httpRouteAdapter(deleteTransactionController)
  );
  app.withTypeProvider<ZodTypeProvider>().get(
    '/balances',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get transactions balance',
        security: [{ bearerAuth: [] }],
        response: {
          200: getTransactionsBalanceResponseSchema,
        },
      },
    },
    httpRouteAdapter(getTransactionsBalanceController)
  );
}
