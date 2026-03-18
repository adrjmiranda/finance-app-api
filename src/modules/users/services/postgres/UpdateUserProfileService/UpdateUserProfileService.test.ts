import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateUserProfileService } from './UpdateUserProfileService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { container } from 'tsyringe';
import bcrypt from 'bcrypt';

describe('UpdateUserProfileService (Integration)', async () => {
	let updateUserProfileService: UpdateUserProfileService;

	beforeEach(async () => {
		await db.delete(usersTable);

		const childContainer = container.createChildContainer();
		updateUserProfileService = childContainer.resolve(UpdateUserProfileService);
	});

	test('should update the user profile', async () => {
		const firstName = 'Adriano';
		const lastName = 'Miranda';
		const email = 'update@test.com';
		const password = 'password123';

		const passwordHash = await bcrypt.hash(password, 10);

		const [createdUser] = await db
			.insert(usersTable)
			.values({
				firstName,
				lastName,
				email,
				passwordHash,
			})
			.returning()
			.execute();

		const { user: updatedUser } = await updateUserProfileService.execute({
			userId: createdUser?.id ?? 'not-found',
			firstName: 'New First Name',
			lastName: 'New Last Name',
			email: 'new-email@test.com',
		});

		assert.ok(updatedUser?.id);
		assert.strictEqual(updatedUser.firstName, 'New First Name');
		assert.strictEqual(updatedUser.lastName, 'New Last Name');
		assert.strictEqual(updatedUser.email, 'new-email@test.com');
	});
});
