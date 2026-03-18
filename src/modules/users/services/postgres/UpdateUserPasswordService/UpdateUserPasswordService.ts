import { injectable } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcrypt';

interface IUpdateUserPassword {
	userId: string;
	oldPassword: string;
	newPassword: string;
}

@injectable()
export class UpdateUserPasswordService {
	public execute = async (data: IUpdateUserPassword): Promise<void> => {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, data.userId))
			.limit(1);

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		const { oldPassword, newPassword } = data;

		const isOldPasswordCorrect = await bcrypt.compare(
			oldPassword,
			user.passwordHash
		);

		if (!isOldPasswordCorrect) {
			throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);

		await db
			.update(usersTable)
			.set({
				passwordHash,
			})
			.where(eq(usersTable.id, data.userId))
			.execute();

		return;
	};
}
