import * as z from 'zod';

import { createUserResponseSchema } from './create-user-response-schema.js';

export const authenticateResponseSchema = z.object({
  user: createUserResponseSchema,
  token: z.string().describe('JWT Access Token'),
});
