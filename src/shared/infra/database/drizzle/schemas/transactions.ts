import {
	numeric,
	pgEnum,
	pgTable,
	pgView,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { sql } from 'drizzle-orm';

export const TRANSACTION_TYPES = ['earning', 'expense', 'investment'] as const;

export const transactionTypeEnum = pgEnum(
	'transaction_type',
	TRANSACTION_TYPES
);

export const transactionsTable = pgTable('transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.references(() => usersTable.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	name: varchar('name', { length: 100 }).notNull(),
	date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
	amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
	type: transactionTypeEnum('type').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const transactionsBalanceView = pgView('transactions_balance_view', {
	userId: uuid('user_id'),
	earnings: numeric('earnings'),
	expenses: numeric('expenses'),
	investments: numeric('investments'),
	balance: numeric('balance'),
}).as(
	sql`
    SELECT 
      ${transactionsTable.userId} as user_id,
      SUM(CASE WHEN ${transactionsTable.type} = 'earning' THEN ${transactionsTable.amount} ELSE 0 END) as earnings,
      SUM(CASE WHEN ${transactionsTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END) as expenses,
      SUM(CASE WHEN ${transactionsTable.type} = 'investment' THEN ${transactionsTable.amount} ELSE 0 END) as investments,
      SUM(CASE WHEN ${transactionsTable.type} = 'earning' THEN ${transactionsTable.amount} ELSE -${transactionsTable.amount} END) as balance
    FROM ${transactionsTable}
    GROUP BY ${transactionsTable.userId}
  `
);
