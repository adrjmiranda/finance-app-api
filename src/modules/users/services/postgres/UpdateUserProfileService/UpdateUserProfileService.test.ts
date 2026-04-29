import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UpdateUserProfileService } from './UpdateUserProfileService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { container } from 'tsyringe';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

describe('UpdateUserProfileService (Integration)', async () => {
  let updateUserProfileService: UpdateUserProfileService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    updateUserProfileService = childContainer.resolve(UpdateUserProfileService);
  });

  test('should update the user profile', async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    const passwordHash = await bcrypt.hash(password, 10);

    const [createdUser] = await db
      .insert(usersTable)
      .values({
        firstName,
        lastName,
        email,
        passwordHash,
      })
      .returning()
      .execute();

    const userDataToUpdate = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
    };

    const { user: updatedUser } = await updateUserProfileService.execute({
      userId: createdUser?.id ?? 'not-found',
      ...userDataToUpdate,
    });

    assert.ok(updatedUser?.id);
    assert.strictEqual(updatedUser.firstName, userDataToUpdate.firstName);
    assert.strictEqual(updatedUser.lastName, userDataToUpdate.lastName);
    assert.strictEqual(updatedUser.email, userDataToUpdate.email);
  });
});
