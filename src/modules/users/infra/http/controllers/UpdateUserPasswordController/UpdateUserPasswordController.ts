import { injectable, container } from 'tsyringe';

import { updateUserPasswordBodySchema } from '#/modules/users/schemas/requests/body/update-user-password-body-schema.js';
import { UpdateUserPasswordService } from '#/modules/users/services/postgres/UpdateUserPasswordService/UpdateUserPasswordService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

@injectable()
export class UpdateUserPasswordController {
	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;
		const { oldPassword, newPassword } = updateUserPasswordBodySchema.parse(
			request.body
		);

		const updateUserPasswordService = container.resolve(
			UpdateUserPasswordService
		);

		await updateUserPasswordService.execute({
			userId,
			oldPassword,
			newPassword,
		});

		return reply.status(204).send();
	};
}
