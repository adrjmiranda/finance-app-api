import { transactionsRoutes } from '#/modules/transactions/infra/htttp/routes/transactions-routes.js';
import { profileRoutes } from '#/modules/users/infra/http/routes/profile-routes.js';
import { usersRoutes } from '#/modules/users/infra/http/routes/users-routes.js';
import type { FastifyInstance } from 'fastify';

export async function appRoutes(app: FastifyInstance): Promise<void> {
	await app.register(usersRoutes, { prefix: '/users' });
	await app.register(profileRoutes, { prefix: '/users' });

	await app.register(transactionsRoutes, { prefix: '/transactions' });
}
