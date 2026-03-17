import { injectable } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';

interface IGetUserProfile {
	userId: string;
}

@injectable()
export class GetUserProfileService {
	public execute = async ({ userId }: IGetUserProfile) => {
		const [user] = await db
			.select({
				id: usersTable.id,
				firstName: usersTable.firstName,
				lastName: usersTable.lastName,
				email: usersTable.email,
				createdAt: usersTable.createdAt,
				updatedAt: usersTable.updatedAt,
			})
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.limit(1);

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		return {
			user,
		};
	};
}
