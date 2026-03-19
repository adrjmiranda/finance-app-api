import { GetTransactionsBalanceService } from '#/modules/transactions/services/postgres/GetTransactionsBalanceService/GetTransactionsBalanceService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { inject, injectable } from 'tsyringe';

injectable();
export class GetTransactionsBalanceController {
	constructor(
		@inject(GetTransactionsBalanceService)
		private getTransactionsBalanceService: GetTransactionsBalanceService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;

		const { earnings, expenses, investiments, balance } =
			await this.getTransactionsBalanceService.execute({ userId });

		return reply
			.status(200)
			.send({ earnings, expenses, investiments, balance });
	};
}
