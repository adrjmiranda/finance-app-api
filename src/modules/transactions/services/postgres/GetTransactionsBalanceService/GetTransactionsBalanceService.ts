import { eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { transactionsBalanceView } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

interface IGetTransactionsBalance {
  userId: string;
}

injectable();
export class GetTransactionsBalanceService {
  public execute = async ({ userId }: IGetTransactionsBalance) => {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    }

    const [overview] = await db
      .select()
      .from(transactionsBalanceView)
      .where(eq(transactionsBalanceView.userId, userId))
      .execute();

    return {
      earnings: Number(overview?.earnings ?? 0),
      expenses: Number(overview?.expenses ?? 0),
      investments: Number(overview?.investments ?? 0),
      balance: Number(overview?.balance ?? 0),
    };
  };
}
