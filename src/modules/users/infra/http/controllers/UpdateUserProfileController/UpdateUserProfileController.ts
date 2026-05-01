import { inject, injectable } from 'tsyringe';

import { updateUserProfileBodySchema } from '#/modules/users/schemas/requests/body/update-user-profile-body-schema.js';
import { UpdateUserProfileService } from '#/modules/users/services/postgres/UpdateUserProfileService/UpdateUserProfileService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class UpdateUserProfileController {
  constructor(
    @inject(UpdateUserProfileService)
    private updateUserProfileService: UpdateUserProfileService
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const userId = String(httpRequest.userId);

    const { firstName, lastName, email } = updateUserProfileBodySchema.parse(
      httpRequest.body
    );

    const { user } = await this.updateUserProfileService.execute({
      userId,
      firstName,
      lastName,
      email,
    });

    return {
      statusCode: 200,
      body: {
        user,
      },
    };
  };
}
