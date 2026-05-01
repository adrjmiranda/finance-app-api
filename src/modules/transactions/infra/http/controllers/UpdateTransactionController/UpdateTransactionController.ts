import { inject, injectable } from 'tsyringe';

import { updateTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/update-transaction-body-schema.js';
import { getTransactionParamsSchema } from '#/modules/transactions/schemas/requests/params/get-transaction-params-schema.js';
import { UpdateTransactionService } from '#/modules/transactions/services/postgres/UpdateTransactionService/UpdateTransactionService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class UpdateTransactionController {
  constructor(
    @inject(UpdateTransactionService)
    private updateTransactionService: UpdateTransactionService
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const userId = String(httpRequest.userId);
    const { transactionId } = getTransactionParamsSchema.parse(
      httpRequest.params
    );
    const { name, date, amount, type } = updateTransactionBodySchema.parse(
      httpRequest.body
    );

    const { transaction } = await this.updateTransactionService.execute({
      userId,
      transactionId,
      name,
      date,
      amount,
      type,
    });

    return {
      statusCode: 200,
      body: {
        transaction,
      },
    };
  };
}
