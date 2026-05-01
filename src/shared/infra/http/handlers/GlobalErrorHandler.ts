import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';

export class GlobalErrorHandler {
  public static handler(
    error: Error,
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    // Zod Error
    if (error instanceof ZodError) {
      const validationErrors = error.issues.reduce(
        (acc, issue) => {
          const path = issue.path[0]?.toString();
          if (path) {
            acc[path] = issue.message;
          }

          return acc;
        },
        {} as Record<string, string>
      );

      return reply.status(400).send({
        code: ERROR_CODES.VALIDATION_ERROR,
        errors: validationErrors,
      });
    }

    // Many Request Error
    if ('status' in error && error.status === 429) {
      return reply.status(429).send({
        code: ERROR_CODES.TOO_MANY_REQUESTS,
      });
    }

    // App Error
    if (error instanceof AppError) {
      return reply.status(error.status).send({
        code: error.code,
      });
    }

    // Internal Server Error
    console.error(error);

    return reply.status(500).send({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
