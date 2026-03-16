import { injectable, container } from 'tsyringe';

import { updateUserProfileBodySchema } from '#/modules/users/schemas/requests/body/update-user-profile-body-schema.js';
import { UpdateUserProfileService } from '#/modules/users/services/postgres/UpdateUserProfileService/UpdateUserProfileService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

@injectable()
export class UpdateUserProfileController {
	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;

		const { firstName, lastName, email } = updateUserProfileBodySchema.parse(
			request.body
		);

		const updateUserProfileService = container.resolve(
			UpdateUserProfileService
		);

		const { user } = await updateUserProfileService.execute({
			userId,
			firstName,
			lastName,
			email,
		});

		return reply.status(200).send({ user });
	};
}
