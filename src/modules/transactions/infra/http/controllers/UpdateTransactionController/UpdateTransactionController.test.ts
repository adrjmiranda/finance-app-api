import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { app } from '#/shared/infra/http/app.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';
import { randomUUID } from 'node:crypto';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

describe('UpdateTransactionController (Integration)', () => {
	beforeEach(async () => {
		await db.delete(usersTable);
	});

	test('should update a transaction', async () => {
		const { authenticatedUser, token } = await createAndAuthenticateUser(app);

		const [createdTransaction] = await db
			.insert(transactionsTable)
			.values({
				name: 'Pizza',
				date: new Date(),
				amount: String(62.0),
				type: 'expense',
				userId: authenticatedUser!.id,
			})
			.returning()
			.execute();

		const payload = {
			name: 'Book',
			date: new Date(),
			amount: 50.0,
			type: 'expense',
		};

		const response = await app.inject({
			method: 'PATCH',
			url: `/transactions/${createdTransaction!.id}`,
			payload,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		assert.strictEqual(response.statusCode, 200);

		const body = JSON.parse(response.payload);

		assert.strictEqual(body.transaction.id, createdTransaction!.id);
		assert.strictEqual(body.transaction.name, payload.name);
		assert.strictEqual(Number(body.transaction.amount), payload.amount);
	});

	test('should throw an error if transaction does not exist', async () => {
		const { token } = await createAndAuthenticateUser(app);

		const payload = {
			name: 'Book',
			date: new Date(),
			amount: 50.0,
			type: 'expense',
		};

		const response = await app.inject({
			method: 'PATCH',
			url: `/transactions/${randomUUID()}`,
			payload,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		assert.strictEqual(response.statusCode, 404);

		const body = JSON.parse(response.payload);

		assert.strictEqual(body.code, ERROR_CODES.TRANSACTION_NOT_FOUND);
	});
});
