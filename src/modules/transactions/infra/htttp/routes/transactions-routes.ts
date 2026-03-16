import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { CreateTransactionController } from '../controllers/CreateTransactionController/CreateTransactionController.js';

export async function transactionsRoutes(app: FastifyInstance) {
	app.addHook('onRequest', VerifyJWT.handle);

	const createTransactionController = container.resolve(
		CreateTransactionController
	);

	app.post('/', createTransactionController.handle);
}
