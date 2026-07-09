import * as z from 'zod';

export const refreshTokenResponseSchema = z.object({
  token: z.string().describe('JWT Access Token'),
  refreshToken: z.string().describe('JWT Refresh Token'),
});
