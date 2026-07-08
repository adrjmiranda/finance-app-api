import * as z from 'zod';

export const refreshTokenResponseSchema = z.object({
  acessToken: z.string().describe('JWT Access Token'),
  refreshToken: z.string().describe('JWT Refresh Token'),
});
