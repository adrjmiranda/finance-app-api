import type { FastifyInstance } from 'fastify';

import { CreateUserController } from '#/modules/users/infra/http/controllers/CreateUserController/CreateUserController.js';
import { GetUserProfileController } from '#/modules/users/infra/http/controllers/GetUserProfileController/GetUserProfileController.js';

export async function usersRoutes(app: FastifyInstance) {
	const createUserController = new CreateUserController();
	const getUserProfileController = new GetUserProfileController();

	app.post('/', createUserController.handle);
	app.get('/:userId', getUserProfileController.handle);
}
