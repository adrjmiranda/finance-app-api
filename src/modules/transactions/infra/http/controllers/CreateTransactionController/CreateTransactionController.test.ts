import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';
import { app } from '#/shared/infra/http/app.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { and, eq } from 'drizzle-orm';
import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import { randomUUID } from 'node:crypto';

describe('CreateTransactionController (Integration)', () => {
	beforeEach(async () => {
		await db.delete(usersTable);
	});

	test('should create a new user', async () => {
		const transactionPayload = {
			name: 'Pizza',
			date: new Date(),
			amount: 62.0,
			type: 'expense',
		};

		const { authenticatedUser, token } = await createAndAuthenticateUser(app);

		const response = await app.inject({
			method: 'POST',
			payload: transactionPayload,
			url: '/transactions',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const body = JSON.parse(response.payload);

		const { transaction } = body;

		assert.strictEqual(response.statusCode, 201);

		assert.ok(transaction);

		assert.strictEqual(transaction.userId, authenticatedUser?.id);
		assert.strictEqual(transaction.name, transactionPayload.name);
		assert.strictEqual(Number(transaction.amount), transactionPayload.amount);

		const [transactionInDb] = await db
			.select()
			.from(transactionsTable)
			.where(
				and(
					eq(transactionsTable.userId, transaction.userId),
					eq(transactionsTable.id, transaction.id)
				)
			)
			.limit(1);

		assert.ok(transactionInDb);
	});

	test('should throw an error if body is invalid', async () => {
		const transactionPayload = {
			name: 'Pizza',
			date: new Date(),
			amount: '62.0',
			type: 'wrong...expense',
		};

		const { authenticatedUser, token } = await createAndAuthenticateUser(app);
		const userId = authenticatedUser?.id ?? randomUUID();

		const response = await app.inject({
			method: 'POST',
			payload: transactionPayload,
			url: '/transactions',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const body = JSON.parse(response.payload);

		assert.strictEqual(response.statusCode, 400);

		assert.strictEqual(body.code, 'VALIDATION_ERROR');
		assert.strictEqual(body.errors.amount, ERROR_CODES.INVALID_AMOUNT);
		assert.strictEqual(body.errors.type, ERROR_CODES.INVALID_TRANSACTION_TYPE);

		const [transactionInDb] = await db
			.select()
			.from(transactionsTable)
			.where(eq(transactionsTable.userId, userId))
			.limit(1);

		assert.ok(!transactionInDb);
	});
});
