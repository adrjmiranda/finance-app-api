import type { FastifyInstance } from 'fastify';

import { createUser } from './user-helper.js';
import { faker } from '@faker-js/faker';

export async function createAndAuthenticateUser(app: FastifyInstance) {
  const password = faker.internet.password();
  const { user } = await createUser({ password });

  const response = await app.inject({
    method: 'POST',
    url: '/users/sessions',
    payload: {
      email: user?.email,
      password,
    },
  });

  const body = JSON.parse(response.payload);

  console.log('BODY ---->', body);

  return {
    token: body.token as string,
    authenticatedUser: user,
    password,
  };
}
