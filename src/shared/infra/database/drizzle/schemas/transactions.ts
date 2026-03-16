import {
	numeric,
	pgEnum,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

export const TRANSACTION_TYPES = ['earning', 'expense', 'investment'] as const;

export const transactionTypeEnum = pgEnum(
	'transaction_type',
	TRANSACTION_TYPES
);

export const transactionsTable = pgTable('transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').references(() => usersTable.id, {
		onDelete: 'cascade',
	}),
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
