import {
	numeric,
	pgEnum,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

export const transactionTypeEnum = pgEnum('trasaction_type', [
	'earning',
	'expense',
	'investment',
]);

export const transactions = pgTable('transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').references(() => usersTable.id),
	name: varchar('name', { length: 256 }),
	date: timestamp('date').defaultNow().notNull(),
	amount: numeric('amount', { precision: 10, scale: 2 }),
	type: transactionTypeEnum('type').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});
