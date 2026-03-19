import { injectable, inject } from 'tsyringe';

import { GetUserProfileService } from '#/modules/users/services/postgres/GetUserProfileService/GetUserProfileService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

@injectable()
export class GetUserProfileController {
	constructor(
		@inject(GetUserProfileService)
		private getUserProfileService: GetUserProfileService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;

		const { user } = await this.getUserProfileService.execute({ userId });

		return reply.status(200).send({ user });
	};
}
