import { inject, injectable } from 'tsyringe';

import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { DeleteTransactionService } from '#/modules/transactions/services/postgres/DeleteTransactionService/DeleteTransactionService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class DeleteTransactionController {
  constructor(
    @inject(DeleteTransactionService)
    private deleteTransactionService: DeleteTransactionService
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const userId = String(httpRequest.userId);
    const { transactionId } = getTransactionParamsSchema.parse(
      httpRequest.params
    );

    await this.deleteTransactionService.execute({ userId, transactionId });

    return {
      statusCode: 204,
    };
  };
}
