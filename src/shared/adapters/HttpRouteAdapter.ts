import type { FastifyReply, FastifyRequest } from 'fastify';

export interface IHttpRequest {
	body?: unknown;
	params?: unknown;
	query?: unknown;
	userId?: string | undefined;
}

export interface IHttpResponse {
	statusCode: number;
	body?: unknown;
	headers?: Record<string, string>;
	redirect?: string;
}

interface IController {
	handle(httpRequest: IHttpRequest): Promise<IHttpResponse>;
}

export const httpRouteAdapter = (controller: IController) => {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user?.sub ? String(request.user.sub) : undefined;

		const httpRequest = {
			body: request.body,
			params: request.params,
			query: request.query,
			userId,
		};

		const httpResponse = await controller.handle(httpRequest);

		const { body, statusCode, headers, redirect } = httpResponse;

		if (headers) {
			Object.entries(headers).forEach(([key, value]) => {
				reply.header(key, value);
			});
		}

		if (redirect) {
			return reply.redirect(redirect);
		}

		return reply.status(statusCode).send(body);
	};
};
