import type { FastifyInstance } from 'fastify';

import { GetUserProfileController } from '#/modules/users/infra/http/controllers/GetUserProfileController/GetUserProfileController.js';
import { UpdateUserProfileController } from '#/modules/users/infra/http/controllers/UpdateUserProfileController/UpdateUserProfileController.js';
import { DeleteUserProfileController } from '#/modules/users/infra/http/controllers/DeleteUserProfileController/DeleteUserProfileController.js';
import { UpdateUserPasswordController } from '#/modules/users/infra/http/controllers/UpdateUserPasswordController/UpdateUserPasswordController.js';

import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';
import { container } from 'tsyringe';
import { httpRouteAdapter } from '#/shared/adapters/HttpRouteAdapter.js';

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

	app.get('/me', httpRouteAdapter(getUserProfileController));
	app.patch('/me', httpRouteAdapter(updateUserProfileController));
	app.patch('/me/password', httpRouteAdapter(updateUserPassword));
	app.delete('/me', httpRouteAdapter(deleteUserProfileController));
}
