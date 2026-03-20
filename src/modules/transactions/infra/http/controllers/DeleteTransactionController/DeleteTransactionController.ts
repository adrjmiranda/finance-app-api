import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { DeleteTransactionService } from '#/modules/transactions/services/postgres/DeleteTransactionService/DeleteTransactionService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { inject, injectable } from 'tsyringe';

@injectable()
export class DeleteTransactionController {
	constructor(
		@inject(DeleteTransactionService)
		private deleteTransactionService: DeleteTransactionService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;
		const { transactionId } = getTransactionParamsSchema.parse(request.params);

		await this.deleteTransactionService.execute({ userId, transactionId });

		return reply.status(204).send();
	};
}
