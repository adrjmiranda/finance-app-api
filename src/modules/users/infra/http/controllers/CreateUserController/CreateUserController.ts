import { inject, injectable } from 'tsyringe';

import { createUserBodySchema } from '#/modules/users/schemas/requests/body/create-user-body-schema.js';
import { CreateUserService } from '#/modules/users/services/postgres/CreateUserService/CreateUserService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

@injectable()
export class CreateUserController {
	constructor(
		@inject(CreateUserService) private createUserService: CreateUserService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const { firstName, lastName, email, password } = createUserBodySchema.parse(
			request.body
		);

		const { user } = await this.createUserService.execute({
			firstName,
			lastName,
			email,
			password,
		});

		return reply.status(201).send({
			user,
		});
	};
}
