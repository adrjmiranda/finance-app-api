import type {
  FastifyReply,
  FastifyRequest,
  FastifySchemaValidationError,
} from 'fastify';
import { ZodError } from 'zod';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';

export class GlobalErrorHandler {
  public static handler(
    error: Error & {
      validation?: FastifySchemaValidationError[];
      statusCode?: number;
    },
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    // 1. PRIORIDADE: Erros do Zod (Tratados nativamente)
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

    // 2. CONTINGÊNCIA: Outros erros de validação (Garantindo compatibilidade limpa)
    if (error.validation) {
      const validationErrors = error.validation.reduce(
        (acc, issue) => {
          // Cast duplo seguro via unknown para desviar do ts(2352) sem usar any
          const genericIssue = issue as unknown as Record<string, unknown>;

          let path = 'error';

          if (issue.instancePath) {
            path = issue.instancePath.replace(/^\//, '');
          } else if (Array.isArray(genericIssue.path) && genericIssue.path[0]) {
            path = genericIssue.path[0].toString();
          }

          // Fallback para string limpa garante que acc[path] nunca quebre com undefined
          acc[path] = issue.message ?? 'Invalid value';

          return acc;
        },
        {} as Record<string, string>
      );

      return reply.status(400).send({
        code: ERROR_CODES.VALIDATION_ERROR,
        errors: validationErrors,
      });
    }

    // 3. Verificação do Rate Limiter (429) usando checagem de propriedade segura
    if ('statusCode' in error && error.statusCode === 429) {
      return reply.status(429).send({
        code: ERROR_CODES.TOO_MANY_REQUESTS,
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.status).send({
        code: error.code,
      });
    }

    console.error(error);

    return reply.status(500).send({
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
