import fastify from 'fastify';
import { GlobalErrorHandler } from './handlers/GlobalErrorHandler.js';
import { appRoutes } from '#/shared/infra/http/routes.js';

const app = fastify({
	logger: true,
});

app.setErrorHandler(GlobalErrorHandler.handler);

app.register(appRoutes);

export { app };
