import { inject, injectable } from 'tsyringe';

import { deleteUserProfileBodySchema } from '#/modules/users/schemas/requests/body/delete-user-profile-body-schema.js';
import { DeleteUserProfileService } from '#/modules/users/services/postgres/DeleteUserProfileService/DeleteUserProfileService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class DeleteUserProfileController {
  constructor(
    @inject(DeleteUserProfileService)
    private deleteUserProfileService: DeleteUserProfileService
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const userId = String(httpRequest.userId);
    const { password } = deleteUserProfileBodySchema.parse(httpRequest.body);

    await this.deleteUserProfileService.execute({
      userId,
      password,
    });

    return {
      statusCode: 204,
    };
  };
}
