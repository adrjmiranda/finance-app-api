import jwt, { type SignOptions } from 'jsonwebtoken';

import type {
  ITokenPayload,
  ITokenProvider,
} from '#/shared/containers/providers/TokenProvider/models/ITokenProvider.js';
import { env } from '#/shared/env/env.js';

export class JasonWebTokenProvider implements ITokenProvider {
  generate(payload: object, subject: string, expiresIn: string): string {
    const options: SignOptions = {
      subject,
    };

    if (expiresIn) {
      options.expiresIn = expiresIn as Exclude<
        SignOptions['expiresIn'],
        undefined
      >;
    }

    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  verify(token: string): ITokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as ITokenPayload;
  }
}
