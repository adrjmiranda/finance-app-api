import fastify from 'fastify';

const app = fastify({
	logger: true,
});

export { app };
