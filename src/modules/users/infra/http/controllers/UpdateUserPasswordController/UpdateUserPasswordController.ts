import { inject, injectable } from 'tsyringe';

import { updateUserPasswordBodySchema } from '#/modules/users/schemas/requests/body/update-user-password-body-schema.js';
import { UpdateUserPasswordService } from '#/modules/users/services/postgres/UpdateUserPasswordService/UpdateUserPasswordService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class UpdateUserPasswordController {
  constructor(
    @inject(UpdateUserPasswordService)
    private updateUserPasswordService: UpdateUserPasswordService
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const userId = String(httpRequest.userId);
    const { oldPassword, newPassword } = updateUserPasswordBodySchema.parse(
      httpRequest.body
    );

    await this.updateUserPasswordService.execute({
      userId,
      oldPassword,
      newPassword,
    });

    return {
      statusCode: 204,
    };
  };
}
