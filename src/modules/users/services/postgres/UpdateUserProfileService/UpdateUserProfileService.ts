import { injectable } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';
import { removeUndefined } from '#/shared/utils/remove-undefined.js';

interface IUpdateUserService {
	userId: string;
	firstName?: string | undefined;
	lastName?: string | undefined;
	email?: string | undefined;
}

@injectable()
export class UpdateUserProfileService {
	public execute = async ({
		userId,
		firstName,
		lastName,
		email,
	}: IUpdateUserService) => {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		if (email) {
			const [userWithSameEmail] = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.email, email));

			if (userWithSameEmail && userWithSameEmail.id !== userId) {
				throw new AppError(ERROR_CODES.EMAIL_ALREADY_IN_USE, 409);
			}
		}

		const updateData = removeUndefined({
			firstName,
			lastName,
			email,
		});

		const [updatedUser] = await db
			.update(usersTable)
			.set({
				...updateData,
			})
			.where(eq(usersTable.id, userId))
			.returning({
				id: usersTable.id,
				firstName: usersTable.firstName,
				lastName: usersTable.lastName,
				email: usersTable.email,
				createdAt: usersTable.createdAt,
				updatedAt: usersTable.updatedAt,
			});

		return { user: updatedUser };
	};
}
