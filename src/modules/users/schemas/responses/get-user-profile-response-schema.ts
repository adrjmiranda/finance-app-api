import * as z from 'zod';

export const getUserProfileResponseSchema = z.object({
  user: z.object({
    id: z.uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});
