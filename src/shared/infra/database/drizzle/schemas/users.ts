import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	firstName: varchar('first_name', { length: 256 }),
	lastName: varchar('last_name', { length: 256 }),
	email: varchar('email', { length: 256 }).unique(),
	password: varchar('password', { length: 256 }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});
