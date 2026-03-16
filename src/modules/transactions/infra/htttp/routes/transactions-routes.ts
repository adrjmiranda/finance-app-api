import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { CreateTransactionController } from '../controllers/CreateTransactionController/CreateTransactionController.js';
import { GetTransactionController } from '../controllers/GetTransactionController/GetTransactionController.js';

export async function transactionsRoutes(app: FastifyInstance) {
	app.addHook('onRequest', VerifyJWT.handle);

	const createTransactionController = container.resolve(
		CreateTransactionController
	);
	const getTransactionController = container.resolve(GetTransactionController);

	app.post('/', createTransactionController.handle);
	app.get('/:transactionId', getTransactionController.handle);
}
