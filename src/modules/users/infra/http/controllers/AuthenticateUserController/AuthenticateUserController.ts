import { authenticateBodySchema } from '#/modules/users/schemas/requests/body/authenticate-body-schema.js';
import { AuthenticateUserService } from '#/modules/users/services/postgres/AuthenticateUserService/AuthenticateUserService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

export class AuthenticateUserController {
	public async handle(request: FastifyRequest, reply: FastifyReply) {
		const { email, password } = authenticateBodySchema.parse(request.body);

		const authenticateUserService = new AuthenticateUserService();
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
	}
}
