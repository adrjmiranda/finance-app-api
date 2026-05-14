import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { container } from 'tsyringe';
import * as z from 'zod';

import { DeleteUserProfileController } from '#/modules/users/infra/http/controllers/DeleteUserProfileController/DeleteUserProfileController.js';
import { GetUserProfileController } from '#/modules/users/infra/http/controllers/GetUserProfileController/GetUserProfileController.js';
import { UpdateUserPasswordController } from '#/modules/users/infra/http/controllers/UpdateUserPasswordController/UpdateUserPasswordController.js';
import { UpdateUserProfileController } from '#/modules/users/infra/http/controllers/UpdateUserProfileController/UpdateUserProfileController.js';
import { updateUserProfileBodySchema } from '#/modules/users/schemas/requests/body/update-user-profile-body-schema.js';
import { getUserProfileResponseSchema } from '#/modules/users/schemas/responses/get-user-profile-response-schema.js';
import { updateUserProfileResponseSchema } from '#/modules/users/schemas/responses/update-user-profile-response-schema.js';
import { httpRouteAdapter } from '#/shared/adapters/HttpRouteAdapter.js';
import { VerifyJWT } from '#/shared/infra/http/middlewares/VerifyJWT.js';

export async function profileRoutes(app: FastifyInstance) {
  app.addHook('onRequest', VerifyJWT.handle);

  const getUserProfileController = container.resolve(GetUserProfileController);
  const updateUserProfileController = container.resolve(
    UpdateUserProfileController
  );
  const updateUserPassword = container.resolve(UpdateUserPasswordController);
  const deleteUserProfileController = container.resolve(
    DeleteUserProfileController
  );

  app.withTypeProvider<ZodTypeProvider>().get(
    '/me',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get a user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: getUserProfileResponseSchema,
        },
      },
    },
    httpRouteAdapter(getUserProfileController)
  );
  app.patch(
    '/me',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update a user profile',
        body: updateUserProfileBodySchema,
        security: [{ bearerAuth: [] }],
        response: {
          200: updateUserProfileResponseSchema,
        },
      },
    },
    httpRouteAdapter(updateUserProfileController)
  );
  app.patch(
    '/me/password',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update a user password',
        security: [{ bearerAuth: [] }],
        response: {
          204: z.never(),
        },
      },
    },
    httpRouteAdapter(updateUserPassword)
  );
  app.delete(
    '/me',
    {
      schema: {
        tags: ['Users'],
        summary: 'Delete a user profile',
        security: [{ bearerAuth: [] }],
        response: {
          204: z.never(),
        },
      },
    },
    httpRouteAdapter(deleteUserProfileController)
  );
}
