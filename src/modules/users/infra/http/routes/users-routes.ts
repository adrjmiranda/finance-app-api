import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { container } from 'tsyringe';

import { AuthenticateUserController } from '#/modules/users/infra/http/controllers/AuthenticateUserController/AuthenticateUserController.js';
import { CreateUserController } from '#/modules/users/infra/http/controllers/CreateUserController/CreateUserController.js';
import { authenticateBodySchema } from '#/modules/users/schemas/requests/body/authenticate-body-schema.js';
import { createUserBodySchema } from '#/modules/users/schemas/requests/body/create-user-body-schema.js';
import { refreshTokenBodySchema } from '#/modules/users/schemas/requests/body/refresh-token-body-schema.js';
import { authenticateResponseSchema } from '#/modules/users/schemas/responses/authenticate-response-schema.js';
import { createUserResponseSchema } from '#/modules/users/schemas/responses/create-user-response-schema.js';
import { refreshTokenResponseSchema } from '#/modules/users/schemas/responses/refresh-token-response-shema.js';
import { httpRouteAdapter } from '#/shared/adapters/HttpRouteAdapter.js';

import { RefreshTokenController } from '../controllers/RefreshTokenController/RefreshTokenController.js';

export async function usersRoutes(app: FastifyInstance) {
  const createUserController = container.resolve(CreateUserController);
  const authenticateUserController = container.resolve(
    AuthenticateUserController
  );
  const refreshTokenController = container.resolve(RefreshTokenController);

  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'Create a user',
        body: createUserBodySchema,
        response: {
          201: createUserResponseSchema,
        },
      },
    },
    httpRouteAdapter(createUserController)
  );
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions',
    {
      schema: {
        tags: ['Users'],
        summary: 'Authenticate a user',
        body: authenticateBodySchema,
        response: {
          200: authenticateResponseSchema,
        },
      },
    },
    httpRouteAdapter(authenticateUserController)
  );
  app.withTypeProvider<ZodTypeProvider>().post(
    '/refresh',
    {
      schema: {
        tags: ['Users'],
        summary: 'Renew access token',
        body: refreshTokenBodySchema,
        response: {
          200: refreshTokenResponseSchema,
        },
      },
    },
    httpRouteAdapter(refreshTokenController)
  );
}
