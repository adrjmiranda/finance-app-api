import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { and, eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';

interface IGetTransaction {
	userId: string;
	transactionId: string;
}

injectable();
export class GetTransactionService {
	public execute = async ({ userId, transactionId }: IGetTransaction) => {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		const [transaction] = await db
			.select()
			.from(transactionsTable)
			.where(
				and(
					eq(transactionsTable.userId, userId),
					eq(transactionsTable.id, transactionId)
				)
			);

		if (!transaction) {
			throw new AppError(ERROR_CODES.TRANSACTION_NOT_FOUND, 404);
		}

		return {
			transaction,
		};
	};
}
