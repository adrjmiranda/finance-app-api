import 'reflect-metadata';

import assert from 'node:assert';
import { beforeEach, describe, test } from 'node:test';

import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';
import { ZodError } from 'zod';

import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';
import type { ITokenProvider } from '#/shared/containers/providers/TokenProvider/models/ITokenProvider.js';
import { AppError } from '#/shared/error/AppError.js';
import { createMockHttpRequest } from '#/test/utils/http-mock.js';

import { RefreshTokenController } from './RefreshTokenController.js';

describe('RefreshTokenController', () => {
  let refreshTokenController: RefreshTokenController;
  let tokenProvider: ITokenProvider;

  beforeEach(() => {
    container.clearInstances();

    container.registerInstance('TokenProvider', {
      generate: () => {},
      verify: () => {},
    });

    tokenProvider = container.resolve<ITokenProvider>('TokenProvider');
    refreshTokenController = container.resolve(RefreshTokenController);
  });

  test('should renew access and refresh tokens successfully', async (t) => {
    const mockToken = faker.string.alphanumeric(32);
    const mockUserId = faker.string.uuid();
    const mockNewAccessToken = faker.string.alphanumeric(32);
    const mockNewRefreshToken = faker.string.alphanumeric(32);

    const mockHttpRequest = createMockHttpRequest({
      body: {
        refreshToken: mockToken,
      },
    });

    t.mock.method(tokenProvider, 'verify', async () => ({
      sub: mockUserId,
    }));

    let generateCallCount = 0;
    t.mock.method(tokenProvider, 'generate', () => {
      generateCallCount++;
      return generateCallCount === 1 ? mockNewAccessToken : mockNewRefreshToken;
    });

    const response = await refreshTokenController.handle(mockHttpRequest);

    assert.strictEqual(generateCallCount, 2);

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.body, {
      token: mockNewAccessToken,
      refreshToken: mockNewRefreshToken,
    });
  });

  test('should throw an AppError if refresh token is invalid or expired', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: {
        refreshToken: 'invalid-token',
      },
    });

    t.mock.method(tokenProvider, 'verify', async () => {
      throw new Error('JWT expired');
    });

    await assert.rejects(
      async () => {
        await refreshTokenController.handle(mockHttpRequest);
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.INVALID_CREDENTIALS);
        assert.strictEqual(error.status, 401);
        return true;
      }
    );
  });

  test('should throw an AppError if token payload does not contain a userId', async (t) => {
    const mockHttpRequest = createMockHttpRequest({
      body: {
        refreshToken: 'token-withouth-sub',
      },
    });

    t.mock.method(tokenProvider, 'verify', async () => ({
      sub: undefined,
    }));

    await assert.rejects(
      async () => {
        await refreshTokenController.handle(mockHttpRequest);
      },
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.strictEqual(error.code, ERROR_CODES.INVALID_CREDENTIALS);
        assert.strictEqual(error.status, 401);
        return true;
      }
    );
  });

  test('should throw a validation error if refreshToken is missing from body', async () => {
    const mockHttpRequest = createMockHttpRequest({
      body: {},
    });

    await assert.rejects(
      async () => {
        await refreshTokenController.handle(mockHttpRequest);
      },
      (error: unknown) => {
        assert.ok(error instanceof ZodError);
        return true;
      }
    );
  });
});
