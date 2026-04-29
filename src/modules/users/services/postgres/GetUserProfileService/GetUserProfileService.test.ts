import 'reflect-metadata';

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GetUserProfileService } from './GetUserProfileService.js';
import { db } from '#/shared/infra/database/drizzle/db.js';
import { usersTable } from '#/shared/infra/database/drizzle/schemas/users.js';
import { container } from 'tsyringe';

import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

describe('GetUserProfileService (Integration)', async () => {
  let getUserProfileService: GetUserProfileService;

  beforeEach(async () => {
    await db.delete(usersTable);

    const childContainer = container.createChildContainer();
    getUserProfileService = childContainer.resolve(GetUserProfileService);
  });

  test('should successfully get the user profile', async () => {
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

    const { user } = await getUserProfileService.execute({
      userId: createdUser?.id ?? 'not-found',
    });

    assert.ok(user?.id);
    assert.strictEqual(user.firstName, userData.firstName);
    assert.strictEqual(user.lastName, userData.lastName);
    assert.strictEqual(user.email, userData.email);
  });
});
