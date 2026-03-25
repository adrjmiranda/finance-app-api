import { updateTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/update-transaction-body-schema.js';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { UpdateTransactionService } from '#/modules/transactions/services/postgres/UpdateTransactionService/UpdateTransactionService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UpdateTransactionController {
	constructor(
		@inject(UpdateTransactionService)
		private updateTransactionService: UpdateTransactionService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;
		const { transactionId } = getTransactionParamsSchema.parse(request.params);
		const { name, date, amount, type } = updateTransactionBodySchema.parse(
			request.body
		);

		const { transaction } = await this.updateTransactionService.execute({
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
