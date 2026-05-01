import { inject, injectable } from 'tsyringe';

import { authenticateBodySchema } from '#/modules/users/schemas/requests/body/authenticate-body-schema.js';
import { AuthenticateUserService } from '#/modules/users/services/postgres/AuthenticateUserService/AuthenticateUserService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';
import type { ITokenProvider } from '#/shared/containers/providers/TokenProvider/models/ITokenProvider.js';

@injectable()
export class AuthenticateUserController {
  constructor(
    @inject(AuthenticateUserService)
    private authenticateUserService: AuthenticateUserService,

    @inject('TokenProvider')
    private tokenProvider: ITokenProvider
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const { email, password } = authenticateBodySchema.parse(httpRequest.body);

    const { user } = await this.authenticateUserService.execute({
      email,
      password,
    });

    const token = this.tokenProvider.generate({}, user.id, '15m');

    return {
      statusCode: 200,
      body: {
        user,
        token,
      },
    };
  };
}
