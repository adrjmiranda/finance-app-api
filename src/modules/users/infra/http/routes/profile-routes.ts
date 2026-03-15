import type { FastifyInstance } from 'fastify';

import { GetUserProfileController } from '#/modules/users/infra/http/controllers/GetUserProfileController/GetUserProfileController.js';
import { UpdateUserProfileController } from '#/modules/users/infra/http/controllers/UpdateUserProfileController/UpdateUserProfileController.js';
import { DeleteUserProfileController } from '#/modules/users/infra/http/controllers/DeleteUserProfileController/DeleteUserProfileController.js';
import { UpdateUserPasswordController } from '#/modules/users/infra/http/controllers/UpdateUserPasswordController/UpdateUserPasswordController.js';

import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';
import { container } from 'tsyringe';

export async function profileRoutes(app: FastifyInstance) {
	app.addHook('onRequest', VerifyJWT.handle);

	const getUserProfileController = container.resolve(GetUserProfileController);
	const updateUserProfileController = container.resolve(
		UpdateUserProfileController
	);
	const updateUserPassword = container.resolve(UpdateUserPasswordController);
	const deleteUserProfileController = container.resolve(
		DeleteUserProfileController
	);

	app.get('/me', getUserProfileController.handle);
	app.patch('/me', updateUserProfileController.handle);
	app.patch('/me/password', updateUserPassword.handle);
	app.delete('/me', deleteUserProfileController.handle);
}
