import * as z from 'zod';

import { createUserResponseSchema } from './create-user-response-schema.js';

export const authenticateResponseSchema = z.object({
  user: createUserResponseSchema.shape.user,
  acessToken: z.string().describe('JWT Access Token'),
  refreshToken: z.string().describe('JWT Refresh Token'),
});
