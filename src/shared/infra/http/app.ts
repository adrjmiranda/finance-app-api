import fastify from 'fastify';
import { GlobalErrorHandler } from './handlers/GlobalErrorHandler.js';
import { appRoutes } from '#/shared/infra/http/routes.js';

import fastifyJwt from '@fastify/jwt';
import { env } from '#/shared/env/env.js';

const app = fastify({
	logger: true,
});

app.setErrorHandler(GlobalErrorHandler.handler);

app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	sign: {
		expiresIn: '7d',
	},
});

app.register(appRoutes);

export { app };
