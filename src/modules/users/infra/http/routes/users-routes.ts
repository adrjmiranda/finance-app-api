import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { container } from 'tsyringe';

import { AuthenticateUserController } from '#/modules/users/infra/http/controllers/AuthenticateUserController/AuthenticateUserController.js';
import { CreateUserController } from '#/modules/users/infra/http/controllers/CreateUserController/CreateUserController.js';
import { authenticateBodySchema } from '#/modules/users/schemas/requests/body/authenticate-body-schema.js';
import { createUserBodySchema } from '#/modules/users/schemas/requests/body/create-user-body-schema.js';
import { authenticateResponseSchema } from '#/modules/users/schemas/responses/authenticate-response-schema.js';
import { createUserResponseSchema } from '#/modules/users/schemas/responses/create-user-response-schema.js';
import { httpRouteAdapter } from '#/shared/adapters/HttpRouteAdapter.js';

export async function usersRoutes(app: FastifyInstance) {
  const createUserController = container.resolve(CreateUserController);
  const authenticateUserController = container.resolve(
    AuthenticateUserController
  );

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
}
