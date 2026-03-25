import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { transactionsTable } from '#/shared/infra/database/drizzle/schemas/transactions.js';
import { createAndAuthenticateUser } from '#/shared/utils/authenticate-user-helper.js';
import { app } from '#/shared/infra/http/app.js';

describe('GetTransactionsBalanceController', () => {
	beforeEach(async () => {
		await db.delete(usersTable);
	});

	test('should return the transactions balance', async () => {
		const { authenticatedUser, token } = await createAndAuthenticateUser(app);

		const earning = 150.0;
		const expense = 62.0;
		const investment = 220.0;
		const balance = earning - expense + investment;

		await db.insert(transactionsTable).values([
			{
				name: 'Pizza',
				date: new Date(),
				amount: String(expense),
				type: 'expense',
				userId: authenticatedUser!.id,
			},
			{
				name: 'Pizza',
				date: new Date(),
				amount: String(earning),
				type: 'earning',
				userId: authenticatedUser!.id,
			},
			{
				name: 'Pizza',
				date: new Date(),
				amount: String(investment),
				type: 'investment',
				userId: authenticatedUser!.id,
			},
		]);

		const response = await app.inject({
			method: 'GET',
			url: '/transactions/balances',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		assert.strictEqual(response.statusCode, 200);

		const body = JSON.parse(response.payload);

		assert.deepStrictEqual(body, {
			earnings: earning,
			expenses: expense,
			investments: investment,
			balance,
		});
	});
});
