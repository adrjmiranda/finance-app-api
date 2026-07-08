import { inject, injectable } from 'tsyringe';
import { z } from 'zod';

import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import type { ITokenProvider } from '#/shared/containers/providers/TokenProvider/models/ITokenProvider.js';
import { AppError } from '#/shared/error/AppError.js';

const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

@injectable()
export class RefreshTokenController {
  constructor(
    @inject('TokenProvider')
    private tokenProvider: ITokenProvider
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const { refreshToken } = refreshTokenBodySchema.parse(httpRequest.body);

    try {
      const { sub: userId } = await this.tokenProvider.verify(refreshToken);

      if (!userId) {
        throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
      }

      const newAccessToken = this.tokenProvider.generate({}, userId, '15m');
      const newRefreshToken = this.tokenProvider.generate({}, userId, '30d');

      return {
        statusCode: 200,
        body: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
    }
  };
}
