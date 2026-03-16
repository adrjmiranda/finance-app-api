import type { FastifyInstance } from 'fastify';

import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';

import { container } from 'tsyringe';

import { CreateTransactionController } from '#/modules/transactions/infra/http/controllers/CreateTransactionController/CreateTransactionController.js';
import { GetTransactionController } from '#/modules/transactions/infra/http/controllers/GetTransactionController/GetTransactionController.js';
import { ListTransactionsController } from '#/modules/transactions/infra/http/controllers/ListTransactionsController/ListTransactionsController.js';
import { UpdateTransactionController } from '#/modules/transactions/infra/http/controllers/UpdateTransactionController/UpdateTransactionController.js';
import { DeleteTransactionController } from '#/modules/transactions/infra/http/controllers/DeleteTransactionController/DeleteTransactionController.js';
import { GetTransactionsBalanceController } from '#/modules/transactions/infra/http/controllers/GetTransactionsBalanceController/GetTransactionsBalanceController.js';

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
	const deleteTransactionController = container.resolve(
		DeleteTransactionController
	);
	const getTransactionsBalanceController = container.resolve(
		GetTransactionsBalanceController
	);

	app.post('/', createTransactionController.handle);
	app.get('/:transactionId', getTransactionController.handle);
	app.get('/', listTransactionsController.handle);
	app.patch('/:transactionId', updateTransactionController.handle);
	app.delete('/:transactionId', deleteTransactionController.handle);
	app.get('/balances', getTransactionsBalanceController.handle);
}
