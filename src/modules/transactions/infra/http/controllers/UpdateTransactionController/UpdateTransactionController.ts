import { updateTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/update-transaction-body-schema copy.js';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { UpdateTransactionService } from '#/modules/transactions/services/postgres/UpdateTransactionService/UpdateTransactionService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { container, injectable } from 'tsyringe';

injectable();
export class UpdateTransactionController {
	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;
		const { transactionId } = getTransactionParamsSchema.parse(request.params);
		const { name, date, amount, type } = updateTransactionBodySchema.parse(
			request.body
		);

		const updateTransactionService = container.resolve(
			UpdateTransactionService
		);

		const { transaction } = await updateTransactionService.execute({
			userId,
			transactionId,
			name,
			date,
			amount,
			type,
		});

		return reply.status(200).send({
			transaction,
		});
	};
}
