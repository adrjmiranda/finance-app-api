import { faker } from '@faker-js/faker';

import type { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';

type UserEntity = typeof usersTable.$inferSelect;

export function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  const defaults = {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    passwordHash: faker.string.alphanumeric(100),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...defaults,
    ...overrides,
  };
}
