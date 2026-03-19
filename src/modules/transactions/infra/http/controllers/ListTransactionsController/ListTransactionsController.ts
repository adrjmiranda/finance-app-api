import { ListTransactionsService } from '#/modules/transactions/services/postgres/ListTransactionsService/ListTransactionsService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { inject, injectable } from 'tsyringe';

injectable();
export class ListTransactionsController {
	constructor(
		@inject(ListTransactionsService)
		private listTransactionsService: ListTransactionsService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;

		const { transactions } = await this.listTransactionsService.execute({
			userId,
		});

		return reply.status(200).send({
			transactions,
		});
	};
}
