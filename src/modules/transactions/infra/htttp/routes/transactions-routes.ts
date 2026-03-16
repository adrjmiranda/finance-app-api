import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { CreateTransactionController } from '../controllers/CreateTransactionController/CreateTransactionController.js';
import { GetTransactionController } from '../controllers/GetTransactionController/GetTransactionController.js';
import { ListTransactionsController } from '../controllers/ListTransactionsController/ListTransactionsController.js';
import { UpdateTransactionController } from '../controllers/UpdateTransactionController/UpdateTransactionController.js';

export async function transactionsRoutes(app: FastifyInstance) {
	app.addHook('onRequest', VerifyJWT.handle);

	const createTransactionController = container.resolve(
		CreateTransactionController
	);
	const getTransactionController = container.resolve(GetTransactionController);
	const listTransactionsController = container.resolve(
		ListTransactionsController
	);
	const updateTransactionController = container.resolve(
		UpdateTransactionController
	);

	app.post('/', createTransactionController.handle);
	app.get('/:transactionId', getTransactionController.handle);
	app.get('/', listTransactionsController.handle);
	app.patch('/:transactionId', updateTransactionController.handle);
}
