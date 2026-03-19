import { injectable, inject } from 'tsyringe';

import { updateUserPasswordBodySchema } from '#/modules/users/schemas/requests/body/update-user-password-body-schema.js';
import { UpdateUserPasswordService } from '#/modules/users/services/postgres/UpdateUserPasswordService/UpdateUserPasswordService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

@injectable()
export class UpdateUserPasswordController {
	constructor(
		@inject(UpdateUserPasswordService)
		private updateUserPasswordService: UpdateUserPasswordService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;
		const { oldPassword, newPassword } = updateUserPasswordBodySchema.parse(
			request.body
		);

		await this.updateUserPasswordService.execute({
			userId,
			oldPassword,
			newPassword,
		});

		return reply.status(204).send();
	};
}
