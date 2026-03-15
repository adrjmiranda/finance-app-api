import { injectable } from 'tsyringe';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { AppError } from '#/shared/error/AppError.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcrypt';

interface ICreateUser {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
}

@injectable()
export class CreateUserService {
	public execute = async ({
		firstName,
		lastName,
		email,
		password,
	}: ICreateUser) => {
		const [userWithSameEmail] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, email))
			.limit(1);

		if (userWithSameEmail) {
			throw new AppError(ERROR_CODES.EMAIL_ALREADY_IN_USE, 400);
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const [createdUser] = await db
			.insert(usersTable)
			.values({
				firstName,
				lastName,
				email,
				passwordHash,
			})
			.returning({
				id: usersTable.id,
				firstName: usersTable.firstName,
				lastName: usersTable.lastName,
				email: usersTable.email,
				createdAt: usersTable.createdAt,
				updatedAt: usersTable.updatedAt,
			});

		return { user: createdUser };
	};
}
