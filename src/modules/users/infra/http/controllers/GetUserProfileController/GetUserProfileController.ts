import { GetUserProfileService } from '#/modules/users/services/postgres/GetUserProfileService/GetUserProfileService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

export class GetUserProfileController {
	public async handle(request: FastifyRequest, reply: FastifyReply) {
		const userId = request.user.sub;

		const getUserProfileService = new GetUserProfileService();

		const { user } = await getUserProfileService.execute({ userId });

		return reply.status(200).send({ user });
	}
}
