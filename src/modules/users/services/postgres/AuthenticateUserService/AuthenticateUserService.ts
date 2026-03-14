import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcrypt';

interface IAuthenticateUser {
	email: string;
	password: string;
}

export class AuthenticateUserService {
	public async execute({ email, password }: IAuthenticateUser) {
		const [user] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, email));

		if (!user) {
			throw new AppError(ERROR_CODES.USER_NOT_FOUND, 404);
		}

		const passwordMatch = await bcrypt.compare(password, user.passwordHash);

		if (!passwordMatch) {
			throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401);
		}

		return {
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		};
	}
}
