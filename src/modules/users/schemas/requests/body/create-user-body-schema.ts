import * as z from 'zod';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

export const createUserBodySchema = z
  .object({
    firstName: z
      .string(ERROR_CODES.INVALID_NAME)
      .transform((value) => value.trim().replace(/\s+/g, ' '))
      .pipe(
        z
          .string(ERROR_CODES.INVALID_NAME)
          .min(3, ERROR_CODES.NAME_VERY_SHORT)
          .max(50, ERROR_CODES.NAME_VERY_LONG)
          .regex(/^[a-zA-ZÀ-ÿ]+$/, ERROR_CODES.INVALID_NAME)
      ),

    lastName: z
      .string(ERROR_CODES.INVALID_NAME)
      .transform((value) => value.trim().replace(/\s+/g, ' '))
      .pipe(
        z
          .string(ERROR_CODES.INVALID_NAME)
          .min(3, ERROR_CODES.NAME_VERY_SHORT)
          .max(50, ERROR_CODES.NAME_VERY_LONG)
          .regex(
            /^[a-zA-ZÀ-ÿ ]+([ '-][a-zA-ZÀ-ÿ ]+)*$/,
            ERROR_CODES.INVALID_NAME
          )
      ),

    email: z.email(ERROR_CODES.INVALID_EMAIL),

    password: z
      .string(ERROR_CODES.INVALID_PASSWORD)
      .min(8, ERROR_CODES.PASSWORD_VERY_SHORT)
      .max(100, ERROR_CODES.PASSWORD_VERY_LONG),

    confirmPassword: z
      .string(ERROR_CODES.INVALID_PASSWORD)
      .min(8, ERROR_CODES.PASSWORD_VERY_SHORT)
      .max(100, ERROR_CODES.PASSWORD_VERY_LONG),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ERROR_CODES.PASSWORD_MISMATCH,
    path: ['confirmPassword'],
  });
