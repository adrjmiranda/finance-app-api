import type { FastifyReply, FastifyRequest } from 'fastify';

import { deleteUserProfileBodySchema } from '#/modules/users/schemas/requests/body/delete-user-profile-body-schema.js';
import { DeleteUserProfileService } from '#/modules/users/services/postgres/DeleteUserProfileService/DeleteUserProfileService.js';

export class DeleteUserProfileController {
	public async handle(request: FastifyRequest, reply: FastifyReply) {
		const userId = request.user.sub;
		const { password } = deleteUserProfileBodySchema.parse(request.body);

		const deleteUserProfileService = new DeleteUserProfileService();

		await deleteUserProfileService.execute({
			userId,
			password,
		});

		return reply.status(204).send();
	}
}
