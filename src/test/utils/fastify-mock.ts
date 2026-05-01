import type { Mock } from 'node:test';

import type { FastifyReply, FastifyRequest } from 'fastify';

export type MockRequest = FastifyRequest & {
  query: unknown;
  params: unknown;
  body: unknown;
  user:
    | {
        sub: string;
      }
    | undefined;
};

export type MockReply = FastifyReply & {
  status: Mock<(code: number) => FastifyReply>;
  send: Mock<(payload?: unknown) => FastifyReply>;
};

interface TestContext {
  mock: {
    fn: <T extends (...args: never[]) => unknown>(
      implementation?: T
    ) => Mock<T>;
  };
}

export function createMockReply(t: TestContext): MockReply {
  const mockReply = {
    status: t.mock.fn((_code: number) => mockReply),
    send: t.mock.fn((_payload?: unknown) => mockReply),
  } as unknown as MockReply;

  return mockReply;
}

export function createMockRequest({
  query,
  params,
  body,
  user,
}: {
  query?: unknown;
  params?: unknown;
  body?: unknown;
  user?: {
    sub: string;
  };
} = {}): MockRequest {
  return {
    query: query ?? {},
    params: params ?? {},
    body: body ?? {},
    user: user ?? undefined,
  } as unknown as MockRequest;
}
