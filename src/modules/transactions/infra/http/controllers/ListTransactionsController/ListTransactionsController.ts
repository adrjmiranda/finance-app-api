import { ListTransactionsService } from '#/modules/transactions/services/postgres/ListTransactionsService/ListTransactionsService.js';
import type {
	IHttpRequest,
	IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ListTransactionsController {
	constructor(
		@inject(ListTransactionsService)
		private listTransactionsService: ListTransactionsService
	) {}

	public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
		const userId = String(httpRequest.userId);

		const { transactions } = await this.listTransactionsService.execute({
			userId,
		});

		return {
			statusCode: 200,
			body: {
				transactions,
			},
		};
	};
}
