import * as z from 'zod';

export const createUserResponseSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
