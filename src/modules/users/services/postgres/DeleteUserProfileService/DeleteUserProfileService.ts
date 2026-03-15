import { injectable } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcrypt';

interface IDeleteUserProfile {
	userId: string;
	password: string;
}

@injectable()
export class DeleteUserProfileService {
	public async execute({
		userId,
		password,
	}: IDeleteUserProfile): Promise<void> {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		const passwordMatch = await bcrypt.compare(password, user.passwordHash);

		if (!passwordMatch) {
			throw new AppError(ERROR_CODES.UNAUTHORIZED, 401);
		}

		await db.delete(usersTable).where(eq(usersTable.id, userId));

		return;
	}
}
