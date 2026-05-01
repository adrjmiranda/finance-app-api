import type { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';

export class VerifyJWT {
  public static handle = async (
    request: FastifyRequest,
    _reply: FastifyReply
  ) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
    }
  };
}
