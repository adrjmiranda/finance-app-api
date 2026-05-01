import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';

import { AuthenticateUserController } from '#/modules/users/infra/http/controllers/AuthenticateUserController/AuthenticateUserController.js';
import { CreateUserController } from '#/modules/users/infra/http/controllers/CreateUserController/CreateUserController.js';
import { httpRouteAdapter } from '#/shared/adapters/HttpRouteAdapter.js';

export async function usersRoutes(app: FastifyInstance) {
  const createUserController = container.resolve(CreateUserController);
  const authenticateUserController = container.resolve(
    AuthenticateUserController
  );

  app.post('/', httpRouteAdapter(createUserController));
  app.post('/sessions', httpRouteAdapter(authenticateUserController));
}
