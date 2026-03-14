import { updateUserProfileBodySchema } from '#/modules/users/schemas/requests/body/update-user-profile-body-schema.js';
import { UpdateUserProfileService } from '#/modules/users/services/postgres/UpdateUserProfileService/UpdateUserProfileService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

export class UpdateUserProfileController {
	public async handle(request: FastifyRequest, reply: FastifyReply) {
		const data = updateUserProfileBodySchema.parse(request.body);

		const updateUserProfileService = new UpdateUserProfileService();

		const { user } = await updateUserProfileService.execute('', data);

		return reply.status(200).send({ user });
	}
}
