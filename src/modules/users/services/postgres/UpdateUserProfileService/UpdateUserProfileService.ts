import { injectable } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';

interface IUpdateUserService {
	firstName?: string | undefined;
	lastName?: string | undefined;
	email?: string | undefined;
}

@injectable()
export class UpdateUserProfileService {
	public execute = async (userId: string, data: IUpdateUserService) => {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, userId));

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		if (data.email) {
			const [userWithSameEmail] = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.email, data.email));

			if (userWithSameEmail && userWithSameEmail.id !== userId) {
				throw new AppError(ERROR_CODES.EMAIL_ALREADY_IN_USE, 409);
			}
		}

		const updateData = Object.fromEntries(
			Object.entries(data).filter(([_, value]) => value !== undefined)
		);

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
