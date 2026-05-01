import { inject, injectable } from 'tsyringe';

import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { GetTransactionService } from '#/modules/transactions/services/postgres/GetTransactionService/GetTransactionService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class GetTransactionController {
  constructor(
    @inject(GetTransactionService)
    private getTransactionService: GetTransactionService
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const userId = String(httpRequest.userId);
    const { transactionId } = getTransactionParamsSchema.parse(
      httpRequest.params
    );

    const { transaction } = await this.getTransactionService.execute({
      userId,
      transactionId,
    });

    return {
      statusCode: 200,
      body: {
        transaction,
      },
    };
  };
}
