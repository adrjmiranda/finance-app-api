import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';

interface ICreateTransaction {
	userId: string;
	name: string;
	date: Date;
	amount: number;
	type: 'earning' | 'expense' | 'investment';
}

@injectable()
export class CreateTransactionService {
	public execute = async ({
		userId,
		name,
		date,
		amount,
		type,
	}: ICreateTransaction) => {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		const [transaction] = await db
			.insert(transactionsTable)
			.values({
				userId,
				name,
				date,
				amount: String(amount),
				type,
			})
			.returning();

		return { transaction };
	};
}
