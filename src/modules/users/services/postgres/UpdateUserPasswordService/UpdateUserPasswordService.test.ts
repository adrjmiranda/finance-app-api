import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { container } from 'tsyringe';

import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { UpdateUserPasswordService } from './UpdateUserPasswordService.js';

import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { AppError } from '#/shared/error/AppError.js';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('UpdateUserPasswordService (Integration)', async () => {
	let updateUserPasswordService: UpdateUserPasswordService;

	beforeEach(async () => {
		await db.delete(usersTable);

		const childContainer = container.createChildContainer();
		updateUserPasswordService = childContainer.resolve(
			UpdateUserPasswordService
		);
	});

	test('should update the user password', async () => {
		const oldPassword = 'old-password';
		const newPassword = 'new-password';

		const userData = {
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'updatepass@test.com',
			password: oldPassword,
		};

		const oldPasswordHash = await bcrypt.hash(oldPassword, 10);

		const [createdUser] = await db
			.insert(usersTable)
			.values({
				firstName: userData.firstName,
				lastName: userData.lastName,
				email: userData.email,
				passwordHash: oldPasswordHash,
			})
			.returning()
			.execute();

		await updateUserPasswordService.execute({
			userId: createdUser?.id ?? 'not-found',
			oldPassword,
			newPassword,
		});

		const [updatedUserWithPassword] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, createdUser?.id ?? 'not-found'))
			.limit(1);

		assert.ok(updatedUserWithPassword);

		const newPasswordIsCorrect = await bcrypt.compare(
			newPassword,
			updatedUserWithPassword.passwordHash
		);

		assert.ok(newPasswordIsCorrect);
	});

	test('should throw an error id ols password does not match', async () => {
		const oldPassword = 'old-password';
		const newPassword = 'new-password';

		const userData = {
			firstName: 'Adriano',
			lastName: 'Miranda',
			email: 'updatepass@test.com',
			password: oldPassword,
		};

		const oldPasswordHash = await bcrypt.hash(oldPassword, 10);

		const [createdUser] = await db
			.insert(usersTable)
			.values({
				firstName: userData.firstName,
				lastName: userData.lastName,
				email: userData.email,
				passwordHash: oldPasswordHash,
			})
			.returning()
			.execute();

		await assert.rejects(
			async () => {
				await updateUserPasswordService.execute({
					userId: createdUser?.id ?? 'not-found',
					oldPassword: 'wrong-old-password',
					newPassword,
				});
			},
			(error: unknown) => {
				assert.ok(error instanceof AppError);
				assert.strictEqual(error.code, ERROR_CODES.INVALID_CREDENTIALS);
				assert.strictEqual(error.status, 401);
				return true;
			}
		);
	});
});
