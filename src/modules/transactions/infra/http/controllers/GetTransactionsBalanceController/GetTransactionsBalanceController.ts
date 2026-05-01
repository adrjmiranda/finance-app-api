import { inject, injectable } from 'tsyringe';

import { GetTransactionsBalanceService } from '#/modules/transactions/services/postgres/GetTransactionsBalanceService/GetTransactionsBalanceService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class GetTransactionsBalanceController {
  constructor(
    @inject(GetTransactionsBalanceService)
    private getTransactionsBalanceService: GetTransactionsBalanceService
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const userId = String(httpRequest.userId);

    const { earnings, expenses, investments, balance } =
      await this.getTransactionsBalanceService.execute({ userId });

    return {
      statusCode: 200,
      body: { earnings, expenses, investments, balance },
    };
  };
}
