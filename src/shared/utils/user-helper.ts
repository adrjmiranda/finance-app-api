import bcrypt from 'bcrypt';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { faker } from '@faker-js/faker';

interface ICreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function createUser(override: Partial<ICreateUserData> = {}) {
  const password = faker.internet.password();
  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({
      ...override,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      passwordHash,
    })
    .returning()
    .execute();

  return { user };
}
