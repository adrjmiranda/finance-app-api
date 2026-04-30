import type { IHttpRequest } from '#/shared/adapters/HttpRouteAdapter.js';

export const createMockHttpRequest = ({
  body,
  params,
  query,
  userId,
}: {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  userId?: string;
} = {}): IHttpRequest => {
  return {
    body: body ?? {},
    params: params ?? {},
    query: query ?? {},
    userId: userId ?? undefined,
  };
};

export const createMockHttpResponse = ({
  statusCode,
  body,
  headers,
  redirect,
}: {
  statusCode: number;
  body?: unknown;
  headers?: Record<string, string>;
  redirect?: string;
}) => {
  return {
    statusCode,
    body: body ?? {},
    headers: headers ?? {},
    redirect: redirect ?? String(undefined),
  };
};
