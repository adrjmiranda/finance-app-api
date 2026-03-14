import { env } from '#/shared/env/index.js';
import { app } from '#/shared/infra/http/app.js';

const start = async (): Promise<void> => {
	try {
		const port = env.SERVER_PORT;
		const host = env.SERVER_HOST;

		await app.listen({ port, host });

		console.log(`Server running on http://${host}:${port}`);
	} catch (error) {
		app.log.error(error);

		process.exit(1);
	}
};

void start();
