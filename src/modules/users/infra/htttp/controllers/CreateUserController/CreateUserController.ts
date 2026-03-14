import { createUserBodySchema } from '#/modules/users/schemas/requests/body/create-user-body-schema.js';
import { CreateUserService } from '#/modules/users/services/postgres/CreateUserService/CreateUserService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

export class CreateUserController {
	public async handle(request: FastifyRequest, reply: FastifyReply) {
		const { firstName, lastName, email, password } = createUserBodySchema.parse(
			request.body
		);

		const createUserService = new CreateUserService();

		const { user } = await createUserService.execute({
			firstName,
			lastName,
			email,
			password,
		});

		return reply.status(201).send({
			user,
		});
	}
}
