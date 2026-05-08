import 'reflect-metadata';
import '#/shared/containers/index.js';

import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { env } from '#/shared/env/env.js';
import { appRoutes } from '#/shared/infra/http/routes.js';

import { GlobalErrorHandler } from './handlers/GlobalErrorHandler.js';

const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(GlobalErrorHandler.handler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'FinanceApp API',
      description: 'FinanceApp API Documentation',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '7d',
  },
});

app.register(appRoutes);

export { app };
