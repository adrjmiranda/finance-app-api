import type { FastifyInstance } from 'fastify';

import { CreateUserController } from '#/modules/users/infra/http/controllers/CreateUserController/CreateUserController.js';

import { AuthenticateUserController } from '#/modules/users/infra/http/controllers/AuthenticateUserController/AuthenticateUserController.js';

export async function usersRoutes(app: FastifyInstance) {
	const createUserController = new CreateUserController();

	const authenticateUserController = new AuthenticateUserController();

	app.post('/', createUserController.handle);

	app.post('/sessions', authenticateUserController.handle);
}
