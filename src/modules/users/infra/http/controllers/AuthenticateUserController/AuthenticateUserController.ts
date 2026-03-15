import { injectable, container } from 'tsyringe';

import { authenticateBodySchema } from '#/modules/users/schemas/requests/body/authenticate-body-schema.js';
import { AuthenticateUserService } from '#/modules/users/services/postgres/AuthenticateUserService/AuthenticateUserService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

@injectable()
export class AuthenticateUserController {
	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const { email, password } = authenticateBodySchema.parse(request.body);

		const authenticateUserService = container.resolve(AuthenticateUserService);

		const { user } = await authenticateUserService.execute({
			email,
			password,
		});

		const token = await reply.jwtSign({
			sub: user.id,
		});

		return reply.status(200).send({
			user,
			token,
		});
	};
}
