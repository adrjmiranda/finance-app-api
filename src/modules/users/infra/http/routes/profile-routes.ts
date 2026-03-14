import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';
import type { FastifyInstance } from 'fastify';

import { GetUserProfileController } from '#/modules/users/infra/http/controllers/GetUserProfileController/GetUserProfileController.js';
import { UpdateUserProfileController } from '#/modules/users/infra/http/controllers/UpdateUserProfileController/UpdateUserProfileController.js';

export async function profileRoutes(app: FastifyInstance) {
	const getUserProfileController = new GetUserProfileController();
	const updateUserProfileController = new UpdateUserProfileController();

	app.addHook('onRequest', VerifyJWT.handle);

	app.get('/me', getUserProfileController.handle);
	app.patch('/me', updateUserProfileController.handle);
}
