import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';

interface IListTransactions {
	userId: string;
}

injectable();
export class ListTransactionsService {
	public execute = async ({ userId }: IListTransactions) => {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		const transactions = await db
			.select()
			.from(transactionsTable)
			.where(eq(transactionsTable.userId, userId));

		return {
			transactions,
		};
	};
}
