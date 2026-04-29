import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DeleteUserProfileService } from './DeleteUserProfileService.js';
import { container } from 'tsyringe';

import bcrypt from 'bcrypt';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

describe('DeleteUserProfileService (Integration)', async () => {
  let deleteUserProfileService: DeleteUserProfileService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    deleteUserProfileService = childContainer.resolve(DeleteUserProfileService);
  });

  test('should successfully delete the user profile', async () => {
    const userData = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const [createdUser] = await db
      .insert(usersTable)
      .values({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash,
      })
      .returning()
      .execute();

    await assert.doesNotReject(async () => {
      await deleteUserProfileService.execute({
        userId: createdUser?.id ?? 'not-found',
        password: userData.password,
      });
    });

    const [deletedUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, createdUser?.id ?? 'not-found'))
      .limit(1);

    assert.ok(!deletedUser?.id);
  });
});
