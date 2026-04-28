import { injectable, inject } from 'tsyringe';

import { GetUserProfileService } from '#/modules/users/services/postgres/GetUserProfileService/GetUserProfileService.js';
import type {
	IHttpRequest,
	IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class GetUserProfileController {
	constructor(
		@inject(GetUserProfileService)
		private getUserProfileService: GetUserProfileService
	) {}

	public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
		const userId = String(httpRequest.userId);

		const { user } = await this.getUserProfileService.execute({ userId });

		return {
			statusCode: 200,
			body: {
				user,
			},
		};
	};
}
