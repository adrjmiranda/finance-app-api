import type { FastifyInstance } from 'fastify';
import { CreateUserController } from '../controllers/CreateUserController/CreateUserController.js';

export async function usersRoutes(app: FastifyInstance) {
	const createUserController = new CreateUserController();

	app.post('/', createUserController.handle);
}
