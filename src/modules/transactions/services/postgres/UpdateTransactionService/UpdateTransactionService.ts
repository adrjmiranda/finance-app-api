import { and, eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import {
  type TRANSACTION_TYPES,
  transactionsTable,
} from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { removeUndefined } from '#/shared/utils/remove-undefined.js';

interface IUpdateTransaction {
  userId: string;
  transactionId: string;
  name?: string | undefined;
  date?: Date | undefined;
  amount?: number | undefined;
  type?: (typeof TRANSACTION_TYPES)[number] | undefined;
}

injectable();
export class UpdateTransactionService {
  public execute = async ({
    userId,
    transactionId,
    name,
    date,
    amount,
    type,
  }: IUpdateTransaction) => {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
    }

    const updateData = removeUndefined({
      name,
      date,
      amount: amount ? String(amount) : undefined,
      type,
    });

    const [updatedTransaction] = await db
      .update(transactionsTable)
      .set({
        ...updateData,
      })
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.id, transactionId)
        )
      )
      .returning()
      .execute();

    if (!updatedTransaction) {
      throw new AppError(ERROR_CODES.TRANSACTION_NOT_FOUND, 404);
    }

    return { transaction: updatedTransaction };
  };
}
