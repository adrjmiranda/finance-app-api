import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	firstName: varchar('first_name', { length: 50 }),
	lastName: varchar('last_name', { length: 50 }),
	email: varchar('email', { length: 100 }).unique(),
	password: varchar('password', { length: 100 }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});
