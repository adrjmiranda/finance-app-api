import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { GetTransactionService } from '#/modules/transactions/services/postgres/GetTransactionService/GetTransactionService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { container, injectable } from 'tsyringe';

injectable();
export class GetTransactionController {
	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;
		const { transactionId } = getTransactionParamsSchema.parse(request.params);

		const getTransactionService = container.resolve(GetTransactionService);

		const { transaction } = await getTransactionService.execute({
			userId,
			transactionId,
		});

		return reply.status(200).send({
			transaction,
		});
	};
}
