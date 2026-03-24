import bcrypt from 'bcrypt';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

export async function createUser() {
	const password = 'password123';
	const passwordHash = await bcrypt.hash(password, 10);

	const [user] = await db
		.insert(usersTable)
		.values({
			firstName: 'Test',
			lastName: 'User',
			email: 'integration@test.com',
			passwordHash,
		})
		.returning()
		.execute();

	return { user };
}
