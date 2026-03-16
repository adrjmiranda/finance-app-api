import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { DeleteTransactionService } from '#/modules/transactions/services/postgres/DeleteTransactionService/DeleteTransactionService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { container, injectable } from 'tsyringe';

injectable();
export class DeleteTransactionController {
	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;
		const { transactionId } = getTransactionParamsSchema.parse(request.params);

		const deleteTransactionService = container.resolve(
			DeleteTransactionService
		);

		await deleteTransactionService.execute({ userId, transactionId });

		return reply.status(204).send();
	};
}
