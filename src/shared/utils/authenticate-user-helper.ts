import type { FastifyInstance } from 'fastify';

import bcrypt from 'bcrypt';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

export async function createAndAuthenticateUser(app: FastifyInstance) {
	const password = 'password123';
	const passwordHash = await bcrypt.hash(password, 10);

	const [user] = await db
		.insert(usersTable)
		.values({
			firstName: 'Test',
			lastName: 'User',
			email: `test-${Date.now()}@example.com`,
			passwordHash,
		})
		.returning()
		.execute();

	const response = await app.inject({
		method: 'POST',
		url: '/users/sessions',
		payload: {
			email: user?.email,
			password,
		},
	});

	const body = JSON.parse(response.payload);

	return {
		token: body.token as string,
		authenticatedUser: user,
	};
}
