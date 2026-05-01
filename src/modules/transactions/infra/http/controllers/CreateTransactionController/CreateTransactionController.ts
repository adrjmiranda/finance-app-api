import { inject, injectable } from 'tsyringe';

import { createTransactionBodySchema } from '#/modules/transactions/schemas/requests/body/create-transaction-body-schema.js';
import { CreateTransactionService } from '#/modules/transactions/services/postgres/CreateTransactionService/CreateTransactionService.js';
import type {
  IHttpRequest,
  IHttpResponse,
} from '#/shared/adapters/HttpRouteAdapter.js';

@injectable()
export class CreateTransactionController {
  constructor(
    @inject(CreateTransactionService)
    private createTransactionService: CreateTransactionService
  ) {}

  public handle = async (httpRequest: IHttpRequest): Promise<IHttpResponse> => {
    const userId = String(httpRequest.userId);
    const { name, date, amount, type } = createTransactionBodySchema.parse(
      httpRequest.body
    );

    const { transaction } = await this.createTransactionService.execute({
      userId,
      name,
      date,
      amount,
      type,
    });

    return {
      statusCode: 201,
      body: {
        transaction,
      },
    };
  };
}
