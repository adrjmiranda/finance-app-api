import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';
import type { FastifyInstance } from 'fastify';

import { GetUserProfileController } from '#/modules/users/infra/http/controllers/GetUserProfileController/GetUserProfileController.js';
import { UpdateUserProfileController } from '#/modules/users/infra/http/controllers/UpdateUserProfileController/UpdateUserProfileController.js';
import { DeleteUserProfileController } from '#/modules/users/infra/http/controllers/DeleteUserProfileController/DeleteUserProfileController.js';
import { UpdateUserPasswordController } from '#/modules/users/infra/http/controllers/UpdateUserPasswordController/UpdateUserPasswordController.js';

export async function profileRoutes(app: FastifyInstance) {
	app.addHook('onRequest', VerifyJWT.handle);

	const getUserProfileController = new GetUserProfileController();
	const updateUserProfileController = new UpdateUserProfileController();
	const updateUserPassword = new UpdateUserPasswordController();
	const deleteUserProfileController = new DeleteUserProfileController();

	app.get('/me', getUserProfileController.handle);
	app.patch('/me', updateUserProfileController.handle);
	app.patch('/me/password', updateUserPassword.handle);
	app.delete('/me', deleteUserProfileController.handle);
}
