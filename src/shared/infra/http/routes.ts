import type { FastifyInstance } from 'fastify';

import { transactionsRoutes } from '#/modules/transactions/infra/http/routes/transactions-routes.js';
import { profileRoutes } from '#/modules/users/infra/http/routes/profile-routes.js';
import { usersRoutes } from '#/modules/users/infra/http/routes/users-routes.js';

export async function appRoutes(app: FastifyInstance): Promise<void> {
  await app.register(usersRoutes, { prefix: '/users' });
  await app.register(profileRoutes, { prefix: '/users' });

  await app.register(transactionsRoutes, { prefix: '/transactions' });
}
