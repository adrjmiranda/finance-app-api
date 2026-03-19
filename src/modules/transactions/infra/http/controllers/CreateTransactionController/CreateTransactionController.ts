import { inject, injectable } from 'tsyringe';

import type { FastifyReply, FastifyRequest } from 'fastify';

import { createTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/create-transaction-body-schema.js';
import { CreateTransactionService } from '#/modules/transactions/services/postgres/CreateTransactionService/CreateTransactionService.js';

@injectable()
export class CreateTransactionController {
	constructor(
		@inject(CreateTransactionService)
		private createTransactionService: CreateTransactionService
	) {}

	public handle = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user.sub;
		const { name, date, amount, type } = createTransactionBodySchema.parse(
			request.body
		);

		const { transaction } = await this.createTransactionService.execute({
			userId,
			name,
			date,
			amount,
			type,
		});

		return reply.status(201).send({ transaction });
	};
}
