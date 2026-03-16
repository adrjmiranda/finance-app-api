import { ListTransactionsService } from '#/modules/transactions/services/postgres/ListTransactionsService/ListTransactionsService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { container, injectable } from 'tsyringe';

injectable();
export class ListTransactionsController {
	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;

		const listTransactionsService = container.resolve(ListTransactionsService);

		const { transactions } = await listTransactionsService.execute({ userId });

		return reply.status(200).send({
			transactions,
		});
	};
}
