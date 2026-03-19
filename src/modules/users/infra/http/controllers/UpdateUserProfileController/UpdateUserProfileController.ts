import { injectable, inject } from 'tsyringe';

import { updateUserProfileBodySchema } from '#/modules/users/schemas/requests/body/update-user-profile-body-schema.js';
import { UpdateUserProfileService } from '#/modules/users/services/postgres/UpdateUserProfileService/UpdateUserProfileService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

@injectable()
export class UpdateUserProfileController {
	constructor(
		@inject(UpdateUserProfileService)
		private updateUserProfileService: UpdateUserProfileService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;

		const { firstName, lastName, email } = updateUserProfileBodySchema.parse(
			request.body
		);

		const { user } = await this.updateUserProfileService.execute({
			userId,
			firstName,
			lastName,
			email,
		});

		return reply.status(200).send({ user });
	};
}
