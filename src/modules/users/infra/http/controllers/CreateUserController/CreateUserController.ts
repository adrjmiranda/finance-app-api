import { inject, injectable } from 'tsyringe';

import { createUserBodySchema } from '#/modules/users/schemas/requests/body/create-user-body-schema.js';
import { CreateUserService } from '#/modules/users/services/postgres/CreateUserService/CreateUserService.js';
import type {
	IHttpRequest,
	IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class CreateUserController {
	constructor(
		@inject(CreateUserService) private createUserService: CreateUserService
	) {}

	public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
		const { firstName, lastName, email, password } = createUserBodySchema.parse(
			httpRequest.body
		);

		const { user } = await this.createUserService.execute({
			firstName,
			lastName,
			email,
			password,
		});

		return {
			statusCode: 201,
			body: { user },
		};
	};
}
