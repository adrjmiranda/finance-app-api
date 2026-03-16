import { GetTransactionsBalanceService } from '#/modules/transactions/services/postgres/GetTransactionsBalanceService/GetTransactionsBalanceService.js';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { container, injectable } from 'tsyringe';

injectable();
export class GetTransactionsBalanceController {
	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;

		const getTransactionsBalanceService = container.resolve(
			GetTransactionsBalanceService
		);

		const { earnings, expenses, investiments, balance } =
			await getTransactionsBalanceService.execute({ userId });

		return reply
			.status(200)
			.send({ earnings, expenses, investiments, balance });
	};
}
